const db = require("../models");
const Address = db.address
const dotenv = require('dotenv');
const { UserBasicDetail } = require("../schema/user_basic_detail_schema");
const { STATUS_CODE } = require('../config/constant')
// get config vars
dotenv.config();
const Message = require("../local/Message");
const User = db.users




class AddressService {
    createUserAddress = async (req) => {
        let lang = Message["en"];
        req.lang = lang;
        const { ADDRESS_CREATED } = req.lang;
        const { addressLine_1, addressLine_2, latitude, longitude, city } = req.body
        try {
            let landmark = null;
            if (req.body.landmark) {
                landmark = req.body.landmark
            }
            const findAdd = await Address.findOne({user_id: req.user.id});
            let address;
            if(findAdd === null){
                address = new Address({
                    user_id: req.user.id,
                    address_line_1: addressLine_1,
                    address_line_2: addressLine_2,
                    landmark,
                    latitude,
                    longitude,
                    city,
                    is_default: 1
                })
                await address.save();
            }else{
                address = new Address({
                    user_id: req.user.id,
                    address_line_1: addressLine_1,
                    address_line_2: addressLine_2,
                    landmark,
                    latitude,
                    longitude,
                    city,
                })
                await address.save();
            }
            
            let user = await User.findOne({ _id: req.user.id })
            if (user.role === "U" && !user.is_verified) {
                await User.findOneAndUpdate({ _id: req.user.id }, { $set: { is_verified: 1 } })
            }
            return {
                statusCode: STATUS_CODE.HTTP_200_OK,
                status: true,
                response: address,
                message: ADDRESS_CREATED,
                metadata: []
            }

        } catch (error) {
            return {
                status: false,
                statusCode: STATUS_CODE.HTTP_500_INTERNAL_SERVER_ERROR,
                response: {},
                message: error.message,
                metadata: []
            }
        }
    }


    updateUserAddress = async (req) => {
        let lang = Message["en"];
        req.lang = lang;
        const { ADDRESS_UPDATED, ADDRESS_NOT_FOUND } = req.lang;
        const { addressLine_1, addressLine_2, landmark, latitude, longitude, state, city, is_default } = req.body;
        const { id } = req.params;
        try {
            if(is_default === 1){
                const update_isDefault = await Address.updateMany({ user_id: req.user.id }, {
                    $set: {
                        is_default:0
                    }
                }, { new: true });
            }
            const updated_address = await Address.findOneAndUpdate({ _id: id }, {
                $set: {
                    address_line_1: addressLine_1,
                    address_line_2: addressLine_2,
                    landmark: landmark,
                    latitude,
                    longitude,
                    city,
                    state,
                    is_default
                }
            }, { new: true })
            if (updated_address) {
                return {
                    statusCode: STATUS_CODE.HTTP_200_OK,
                    status: true,
                    response: updated_address,
                    message: ADDRESS_UPDATED,
                    metadata: []
                }
            }
            else {
                return {
                    statusCode: STATUS_CODE.HTTP_200_OK,
                    status: true,
                    response: {},
                    message: ADDRESS_NOT_FOUND,
                    metadata: []
                }
            }
        } catch (error) {
            return {
                status: false,
                statusCode: STATUS_CODE.HTTP_500_INTERNAL_SERVER_ERROR,
                response: {},
                message: error.message,
                metadata: []
            }
        }
    }


    deleteUserAddress = async (req) => {
        let lang = Message["en"];
        req.lang = lang;
        const { ADDRESS_DELETED, ADDRESS_NOT_FOUND } = req.lang;
        const { id } = req.params
        try {
            let response = await Address.findOneAndDelete({ _id: id })
            if (response) {
                return {
                    statusCode: STATUS_CODE.HTTP_200_OK,
                    status: true,
                    response: response,
                    message: ADDRESS_DELETED,
                    metadata: []
                }
            }
            else {
                return {
                    statusCode: STATUS_CODE.HTTP_400_BAD_REQUEST,
                    status: false,
                    response: {},
                    message: ADDRESS_NOT_FOUND,
                    metadata: []
                }
            }
        } catch (error) {
            return {
                status: false,
                statusCode: STATUS_CODE.HTTP_500_INTERNAL_SERVER_ERROR,
                response: {},
                message: error.message,
                metadata: []
            }
        }
    }

    getUserAddress = async (req) => {
        let lang = Message["en"];
        req.lang = lang;
        const { ADDRESSES_FETCHED,NO_ADDRESSES_CREATED } = req.lang;
        try {
            const page = parseInt(req.query.page);
            let limit = parseInt(process.env.PAGE_LIMIT)
            const addresses = await Address.find({ user_id: req.user.id })
                .skip((limit * page) - limit).limit(limit)
            if (addresses.length) {
                //-----------------------------Pagination----------------------------------------------------------------------------------//
                const total_count = await Address.find({ user_id: req.user.id }).countDocuments()
                const startIndex = (page - 1) * limit;
                const endIndex = page * limit;
                const results = {};
                let prev_page;
                let next_page;
                if (startIndex > 0) {
                    results.previous = {
                        page: page - 1,
                        limit: limit
                    }
                }
                if (endIndex < total_count) {
                    results.next = {
                        page: page + 1,
                        limit: limit
                    }
                }
                const count = addresses.length
                const totalPages = Math.ceil(total_count / limit);
                const currentPage = Math.ceil((startIndex - 1) / limit) + 1;
                if (totalPages === currentPage) {
                    next_page = null;
                } else {
                    next_page = results.next.page;
                }
                if (currentPage === 1) {
                    prev_page = null;
                } else {
                    prev_page = results.previous.page;
                }

                return {
                    statusCode: STATUS_CODE.HTTP_200_OK,
                    status: true,
                    response: {
                        addresses,
                        paginationData: { count, total_count, totalPages, currentPage, prev_page, next_page }
                    },
                    message: ADDRESSES_FETCHED,
                    metadata: []
                }
            }
            else {
                return {
                    statusCode: STATUS_CODE.HTTP_404_NOT_FOUND,
                    status: false,
                    response: {},
                    message: NO_ADDRESSES_CREATED,
                    metadata: []
                }
            }
        } catch (error) {
            return {
                status: false,
                statusCode: STATUS_CODE.HTTP_500_INTERNAL_SERVER_ERROR,
                response: {},
                message: error.message,
                metadata: []
            }
        }
    }
}

module.exports = new AddressService();