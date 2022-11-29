module.exports = mongoose => {
    const { Schema } = mongoose;
    const Post = mongoose.model(
        "post",
        mongoose.Schema(
            {
                user_id: {
                    type: Schema.Types.ObjectId,
                    ref: 'User'
                },
                parent_post_id: {
                    type: Schema.Types.ObjectId,
                    ref: 'User',
                    default: null
                },
                images: Array,
                videos: Array,
                post_desc: {
                    type: String,
                    default: null
                },
                like_count: {
                    type: Number,
                    default: 0
                },
                comment_count: {
                    type: Number,
                    default: 0
                },
                city: String,
                latitude: String,
                longitude: String,
                visibility_permission: { type: Number, enum: [0, 1, 2], default: 0 }, // 0 -> Anyone can see the post, 1-> Followers can see the post, 2-> no can see
                comment_permission: { type: Number, enum: [0, 1, 2], default: 0 }, // 0 -> Anyone, 1-> Followers, 2-> No one
                status: { type: Number, enum: [0, 1], default: 0 },
            },
            { timestamps: true }
        )
    );

    return Post;
};