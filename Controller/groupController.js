const cloudinary = require('../Config/Cloudinary');
const GroupModel = require('../Model/GroupModel');
const MemberModel = require('../Model/MembersModel');


const createGroup = async (req, res) => {
    try {
        const { name, userId, limit } = req.body;
        const file = req.file;
        console.log(name,userId,limit,file)

        const result = await cloudinary.uploader.upload(file.path);
        const group = new GroupModel({
            name,
            image: result.secure_url,
            createrId: userId,
            limit
        });
        const newGroup = await group.save();
        res.status(201).json({message:'Group created successfully',success:true});

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
        const group = await GroupModel.find({createrId:id});// Populate users if it's a reference
        
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
        const existingMembers = await MemberModel.find({ groupId: groupId });

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




module.exports = {
    createGroup,
    getUsersInGroup,
    AddUser_group
}