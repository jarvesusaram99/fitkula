module.exports = mongoose => {
    const { Schema } = mongoose;
    const Address = mongoose.model(
        "address",
        mongoose.Schema(
            {
                user_id: {
                    type: Schema.Types.ObjectId,
                    ref: 'User'
                },
                address_line_1: {
                    type: String,
                    require: true,
                },
                address_line_2: String,
                landmark: { type: String, default: null },
                city: String,
                // state: { type: String, default: null },
                latitude: String,
                longitude: String,
                is_save_for_future: { type: Number, enum: [0, 1], default: 0 },
                is_default: { type: Number, enum: [0, 1], default: 0 },
            },
            { timestamps: true }
        )
    );

    return Address;
};