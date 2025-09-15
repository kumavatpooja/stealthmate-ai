const Resume = require('../models/Resume');
const parseResume = require('../utils/parseResume');

exports.uploadResume = async (req, res) => {
  const { base64, fileType, extraInfo } = req.body;

  try {
    const text = await parseResume(base64, fileType);
    const newResume = new Resume({
      user: req.userId,
      resumeText: text,
      extraInfo,
    });

    await newResume.save();
    res.json({ message: 'Resume uploaded and parsed successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Resume upload failed', error: err.message });
  }
};














