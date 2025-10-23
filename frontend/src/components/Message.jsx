const styleFromMessageSource = (author, userAuthor) => 
{
    if (author.id === userAuthor.id)
        return 'justify-end';
    return 'justify-start';
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
    return (<div className={`flex ${styleFromMessageSource(author, userAuthor)} w-full min-h-0 mb-2`}>
        <div className={`text-left text-white text-lg max-w-max w-1/2 p-2 break-words rounded-xl`}>
            {text}
        </div>
    </div>);
};

export default Message;