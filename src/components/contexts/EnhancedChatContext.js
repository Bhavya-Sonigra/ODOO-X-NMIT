import React, { createContext, useContext, useState } from 'react';
import ApiService from '../../services/apiService';

const EnhancedChatContext = createContext();

export const EnhancedChatProvider = ({ children }) => {
    const [blockedUsers, setBlockedUsers] = useState([]);
    const [chatList, setChatList] = useState([]);
    const [loading, setLoading] = useState(false);

    // Get authentication token
    const getAuthToken = () => {
        return localStorage.getItem('token');
    };

    // Get current user ID
    const getCurrentUserId = () => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            return user.userId;
        }
        return null;
    };

    // Fetch blocked users
    const fetchBlockedUsers = async () => {
        const userId = getCurrentUserId();
        if (!userId) return;

        setLoading(true);
        try {
            const response = await fetch(ApiService.chat.getBlockedUsers(userId));
            if (response.ok) {
                const data = await response.json();
                setBlockedUsers(data.blockedUsers || []);
            } else {
                console.error('Failed to fetch blocked users');
            }
        } catch (error) {
            console.error('Error fetching blocked users:', error);
        } finally {
            setLoading(false);
        }
    };

    // Block/Unblock user
    const toggleBlockUser = async (blockedUserId) => {
        const userId = getCurrentUserId();
        if (!userId) return;

        try {
            const response = await fetch(ApiService.chat.blockUser(userId), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ blockedUserId })
            });

            if (response.ok) {
                const data = await response.json();
                // Update blocked users list
                if (data.message === 'User blocked') {
                    setBlockedUsers(prev => [...prev, blockedUserId]);
                } else if (data.message === 'User unblocked') {
                    setBlockedUsers(prev => prev.filter(id => id !== blockedUserId));
                }
                return { success: true, message: data.message };
            } else {
                throw new Error('Failed to block/unblock user');
            }
        } catch (error) {
            console.error('Error blocking/unblocking user:', error);
            return { success: false, message: error.message };
        }
    };

    // Fetch chat list
    const fetchChatList = async () => {
        const userId = getCurrentUserId();
        if (!userId) return;

        setLoading(true);
        try {
            const response = await fetch(ApiService.chat.getChatList(userId));
            if (response.ok) {
                const data = await response.json();
                setChatList(data.chatList || []);
            } else {
                console.error('Failed to fetch chat list');
            }
        } catch (error) {
            console.error('Error fetching chat list:', error);
        } finally {
            setLoading(false);
        }
    };

    // Mark messages as seen
    const markMessagesAsSeen = async (chatId) => {
        const userId = getCurrentUserId();
        if (!userId) return;

        try {
            const response = await fetch(ApiService.chat.markSeen(chatId), {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userId })
            });

            if (response.ok) {
                // Update chat list to mark messages as seen
                setChatList(prev => 
                    prev.map(chat => 
                        chat._id === chatId 
                            ? { ...chat, unreadCount: 0 }
                            : chat
                    )
                );
                return { success: true };
            } else {
                throw new Error('Failed to mark messages as seen');
            }
        } catch (error) {
            console.error('Error marking messages as seen:', error);
            return { success: false, message: error.message };
        }
    };

    // Delete chat
    const deleteChat = async (chatId) => {
        const userId = getCurrentUserId();
        if (!userId) return;

        try {
            const response = await fetch(ApiService.chat.deleteChat(chatId), {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userId })
            });

            if (response.ok) {
                // Remove chat from list or mark as deleted
                setChatList(prev => prev.filter(chat => chat._id !== chatId));
                return { success: true, message: 'Chat deleted' };
            } else {
                throw new Error('Failed to delete chat');
            }
        } catch (error) {
            console.error('Error deleting chat:', error);
            return { success: false, message: error.message };
        }
    };

    // Delete message
    const deleteMessage = async (messageId, senderId) => {
        try {
            const response = await fetch(`${ApiService.chat.deleteMessage(messageId)}?senderId=${senderId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                return { success: true, message: 'Message deleted' };
            } else {
                throw new Error('Failed to delete message');
            }
        } catch (error) {
            console.error('Error deleting message:', error);
            return { success: false, message: error.message };
        }
    };

    const value = {
        blockedUsers,
        chatList,
        loading,
        fetchBlockedUsers,
        toggleBlockUser,
        fetchChatList,
        markMessagesAsSeen,
        deleteChat,
        deleteMessage
    };

    return (
        <EnhancedChatContext.Provider value={value}>
            {children}
        </EnhancedChatContext.Provider>
    );
};

export const useEnhancedChat = () => {
    const context = useContext(EnhancedChatContext);
    if (!context) {
        throw new Error('useEnhancedChat must be used within an EnhancedChatProvider');
    }
    return context;
};

export default EnhancedChatContext;
