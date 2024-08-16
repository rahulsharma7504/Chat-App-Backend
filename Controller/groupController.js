const cloudinary = require('../Config/Cloudinary');
const GroupModel = require('../Model/GroupModel');


const createGroup = async (req, res) => {
    try {
        const { name, userId, limit } = req.body;
        const file = req.file;

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
        console.log('Group data:', group);

    } catch (error) {
        console.error('Error fetching group:', error.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};


module.exports = {
    createGroup,
    getUsersInGroup
}