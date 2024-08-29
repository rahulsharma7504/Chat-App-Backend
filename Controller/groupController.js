const cloudinary = require('../Config/Cloudinary');
const GroupModel = require('../Model/GroupModel');
const MemberModel = require('../Model/MembersModel');
const MessageModel = require('../Model/GroupChatModel');
// import {io} from '../index'
const { io, groupNamespace } = require('../index');
const { Socket } = require('socket.io');

const createGroup = async (req, res) => {
    try {
        const { name, userId, limit } = req.body;
        const file = req.file;
        console.log(name, userId, limit, file)

        const result = await cloudinary.uploader.upload(file.path);
        const group = new GroupModel({
            name,
            image: result.secure_url,
            createrId: userId,
            limit
        });
        const newGroup = await group.save();
        res.status(201).json({ message: 'Group created successfully', success: true });

    } catch (error) {
        res.status(500).json({ message: error.message });
        console.error('Error creating group:', error.message);
    }
}

const getUsersInGroup = async (req, res) => {
    try {
        const id = req.params.id;
        console.log(`Fetching group with ID: ${id}`);

        // Find the group by ID
        const group = await GroupModel.find({ createrId: id });// Populate users if it's a reference

        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // Respond with the group data
        res.status(200).json(group);

    } catch (error) {
        console.error('Error fetching group:', error.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};


const AddUser_group = async (req, res) => {
    try {
        // Destructuring groupId and users from the request body
        const { groupId, users } = req.body;

        // Find all members in the group
        const GroupID = await GroupModel.find({ _id: groupId });
        console.log();

        const existingMembers = await MemberModel.find({ groupId: groupId });
        // Check if the group has reached its limit
        if (GroupID[0].limit <= existingMembers.length) {
            return res.status(400).json({ message: 'Group reached its limit' });
        }

        // Extract existing userIds from the found members
        const existingUserIds = existingMembers.map(member => member.userId.toString());

        // Filter out users that are already in the group
        const newUsers = users.filter(userId => !existingUserIds.includes(userId));
        // Create an array of members to insert
        const membersToInsert = newUsers.map(userId => ({
            groupId: groupId,
            userId: userId
        }));

        // Insert the new members if there are any
        if (membersToInsert.length > 0) {
            await MemberModel.insertMany(membersToInsert);
        }

        res.status(201).json({ message: 'Users added successfully', success: true });
    } catch (error) {
        console.error('Error adding users to group:', error.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};


const EditGroup = async (req, res) => {
    try {
        const { name, limit } = req.body;
        const id = req.params.id;
        console.log(`Editing group with ID: ${id}`);
        console.log(name, limit);


        // Find the group by ID
        const findGroup = await GroupModel.findById(id);

        if (!findGroup) {
            return res.status(404).json({ message: 'Group not found' });
        } else {
            // Update the group
            findGroup.name = name;
            findGroup.limit = limit;
            await findGroup.save();
        }

        // // Respond with the updated group data
        res.status(200).json({ success: true, message: 'Group Update Successfully' });

    } catch (error) {
        console.error('Error fetching group:', error.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};


const DeleteGroup = async (req, res) => {
    try {
        const id = req.params.id;
        console.log(`Deleting group with ID: ${id}`);
  
        // Find the group by ID
        const findGroup = await GroupModel.findByIdAndDelete(id);
        // Delete all chat messages related to this group
        await MessageModel.deleteMany({ groupId: id });
        // Delete all members related to this group
        await MemberModel.deleteMany({ groupId: id });
        res.status(200).json({ message: 'Group deleted successfully' });

    } catch (error) {   
        console.error('Error fetching group:', error.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

const JoinUserByLink = async (req, res) => {
    try {
        const id = req.params.id;
        // Find the group by ID
        const findGroup = await GroupModel.findById({ _id: id });

        if (!findGroup) {
            return res.status(404).json({ message: 'Group not found' });
        } else if (findGroup.createrId === req.body.userId) {
            return res.status(200).json({ message: 'You are the creator of this group' });
        }

        const countMembers = await MemberModel.find({ groupId: id });
        // Check if the group has reached its limit
        if (findGroup.limit <= countMembers.length) {
            return res.status(400).json({ message: ' Sorry ! This Group is Full' });
        }

        const checkMember = await MemberModel.find({ groupId: id, userId: req.body.userId });

        if (checkMember.length === 0) {
            const newMember = new MemberModel({
                groupId: id,
                userId: req.body.userId
            });
            await newMember.save();
            return res.status(201).json({ message: 'You joined this group successfully', success: true });
        } else {
            return res.status(200).json({ message: 'User already joined this group' });
        }

    } catch (error) {
        console.error('Error fetching group:', error.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};



const getAllGroups = async (req, res) => {
    try {
        const id = req.params.id;

        // Find groups created by the user
        const findGroup = await GroupModel.find({ createrId: id });

        // Find all group memberships for the user
        const findUserGroup = await MemberModel.find({ userId: id });

        // Extract group IDs from the memberships
        const groupIds = findUserGroup.map(member => member.groupId);

        // Find groups where the user is a member
        const findUserInGroup = await GroupModel.find({ _id: { $in: groupIds } });

        if (findGroup.length > 0 || findUserInGroup.length > 0) {
            return res.status(200).json({ message: 'Success', data: { findGroup, findUserInGroup } });
        } else {
            return res.status(404).json({ message: 'No groups found for this user' });
        }
    } catch (error) {
        console.error('Error fetching groups:', error.message);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};



const getGroupInfo = async (req, res) => {
    try {
        const groupId = req.body.id;
        const findGroup = await GroupModel.findById(groupId);
        if (!findGroup) {
            return res.status(404).json({ message: 'Group not found' });
        }
        return res.status(200).json({ findGroup });
    } catch (error) {
        console.error('Error fetching groups:', error.message);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};



const groupChatMessage = async (req, res) => {
    try {
        const { userId, groupId, message } = req.body;
        // Save the message to the database
        const SaveChat = new MessageModel({
            userId,
            groupId,
            message
        });
        await SaveChat.save();
        res.status(200).send(SaveChat)

    } catch (error) {
        console.error('Error sending message:', error.message);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

const updateGroupMessage = async (req, res) => {
    try {
        const {message}=req.body;
        const {id}=req.params;
        // Find the message by ID
        const findMessage = await MessageModel.findByIdAndUpdate(id, { message }, { new: true });
        if (!findMessage) {
            return res.status(404).json({ message: 'Message not found' });
        }
        return res.status(200).json({ message: 'Message updated successfully' });


    } catch (error) {
        console.error('Error sending message:', error.message);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};


const deleteGroupMessage = async (req, res) => {
    try {
        const {id}=req.params;
        // Find the message by ID
        const findMessage = await MessageModel.findByIdAndDelete(id); 
        if (!findMessage) {
            return res.status(404).json({ message: 'Message not found' });
        }
        return res.status(200).json({ message: 'Message deleted successfully' });


    } catch (error) {
        console.error('Error sending message:', error.message);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};
module.exports = {
    createGroup,
    getUsersInGroup,
    AddUser_group,
    EditGroup,
    DeleteGroup,
    JoinUserByLink,
    getAllGroups,
    getGroupInfo,
    groupChatMessage,
    updateGroupMessage,
    deleteGroupMessage
}
//     groupchats