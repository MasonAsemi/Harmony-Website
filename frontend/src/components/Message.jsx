const colorFromSource = (author, currentUser) => 
{
    if (author.id === currentUser.id)
        return 'bg-rose-400';
    return 'bg-white';
};

const sideFromSource = (author, currentUser) => 
{
    if (author.id === currentUser.id)
        return 'items-start';
    return 'items-end';
    
}

/**
 * 
 * @param {Author} author - The author of the message
 * @param {Author} currentUser - The currently authenticated user as an Author
 * @param {string} author - Message text
 * @returns 
 */
const Message = ({ author, currentUser, text }) =>
{
    return <div>
        <div className={`flex flex-col gap-2 w-full ${sideFromSource(author, currentUser)}`}>
            <div className={``}>{author.username}</div>
            <div className={`flex ${colorFromSource(author, currentUser)} rounded-2xl w-max min-h-0 mb-2`}>
                <div className={`text-left text-black text-lg w-max p-4 wrap-break-word rounded-xl`}>
                    <div>{text}</div>
                </div>
            </div>
        </div>
    </div>;
};

export default Message;