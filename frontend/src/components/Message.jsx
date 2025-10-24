const styleFromMessageSource = (author, userAuthor) => 
{
    if (author.id === userAuthor.id)
        return 'justify-start';
    return 'justify-end';
};

/**
 * 
 * @param {Author} author - The author of the message
 * @param {Author} userAuthor - The currently authenticated user as an Author
 * @param {string} author - Message text
 * @returns 
 */
const Message = ({ author, userAuthor, text }) =>
{
    return <div>
        <div className={``}>{author.username}</div>
        <div className={`flex ${styleFromMessageSource(author, userAuthor)} bg-white rounded-2xl w-full min-h-0 mb-2`}>
            <div className={`text-left text-black text-lg max-w-max w-1/2 p-2 wrap-break-word rounded-xl`}>
                <div>{text}</div>
            </div>
        </div>
    </div>;
};

export default Message;