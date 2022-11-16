module.exports = mongoose => {
    const { Schema } = mongoose;
    const PostComments = mongoose.model(
        "post_comments",
        mongoose.Schema(
            {
                user_id: {
                    type: Schema.Types.ObjectId,
                    ref: 'User'
                },
                post_id: {
                    type: Schema.Types.ObjectId,
                    ref: 'Post'
                },
                comment: String,
            },
            { timestamps: true }
        )
    );

    return PostComments;
};