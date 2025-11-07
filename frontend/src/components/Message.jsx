const colorFromSource = (author, userAuthor) => 
{
    if (author.id === userAuthor.id)
        return 'bg-rose-400';
    return 'bg-white';
};

const sideFromSource = (author, userAuthor) => 
{
    if (author.id === userAuthor.id)
        return 'items-start';
    return 'items-end';
    
}

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
        <div className={`flex flex-col gap-2 w-full ${sideFromSource(author, userAuthor)}`}>
            <div className={``}>{author.username}</div>
            <div className={`flex ${colorFromSource(author, userAuthor)} rounded-2xl w-max min-h-0 mb-2`}>
                <div className={`text-left text-black text-lg w-max p-4 wrap-break-word rounded-xl`}>
                    <div>{text}</div>
                </div>
            </div>
        </div>
    </div>;
};

export default Message;