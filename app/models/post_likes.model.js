module.exports = mongoose => {
    const { Schema } = mongoose;
    const PostLikes = mongoose.model(
        "post_likes",
        mongoose.Schema(
            {
                post_id: {
                    type: Schema.Types.ObjectId,
                    ref: 'Post'
                },
                user_id: {
                    type: Schema.Types.ObjectId,
                    ref: 'User'
                },
            },
            { timestamps: true }
        )
    );

    return PostLikes;
};