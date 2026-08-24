// import dependencies
import Party from "../models/PartyModel.js";
import asyncHandler from "express-async-handler";

// Add  Party
export const setParty = asyncHandler(async (req, res) => {
  try {
    const prt = new Party(req.body);
    const saved = await prt.save();
    if (!saved) {
      return res.status(404).json({ message: `cannot add any Party` });
    }
    return res.status(200).json(saved);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// get all prts
export const getParty = asyncHandler(async (req, res) => {
  try {
    const prt = await Party.find().sort({
      createdAt: -1,
    });
    if (!prt) {
      return res.status(404).json({ message: `cannot find any Party` });
    }
    return res.status(200).json(prt);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// get a Party by id
export const getPartyById = asyncHandler(async (req, res) => {
  try {
    const prt = await Party.findById(req.params.id); // FIX: Removed .sort() as findById returns a single document
    if (!prt) {
      return res.status(404).json({ message: `cannot find any Party id` });
    }
    return res.status(200).json(prt);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// get a Party by key
export const getPartyByEvent = asyncHandler(async (req, res) => {
  try {
    const prt = await Party.find({
      $or: [
        {
          event: {
            $regex: req.params.event,
          },
        },
      ],
    }).sort({ createdAt: -1 });
    if (!prt) {
      return res.status(404).json({ message: `cannot find any Party id` });
    }
    return res.status(200).json(prt);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// get a Party by key
export const getPartyByKey = asyncHandler(async (req, res) => {
  try {
    const prt = await Party.find({
      event: {
        $regex: req.params.event,
      },
      $or: [
        {
          name: {
            $regex: req.params.key,
          },
        },
        {
          parentName: {
            $regex: req.params.key,
          },
        },
        {
          childName: {
            $regex: req.params.key,
          },
        },
        {
          company: {
            $regex: req.params.key,
          },
        },
        {
          school: {
            $regex: req.params.key,
          },
        },
        {
          email: {
            $regex: req.params.key,
          },
        },
        {
          phone: {
            $regex: req.params.key,
          },
        },
        {
          address: {
            $regex: req.params.key,
          },
        },
        {
          referral: {
            $regex: req.params.key,
          },
        },
      ],
    }).sort({ createdAt: -1 });
    if (!prt) {
      return res.status(404).json({ message: `cannot find any Party id` });
    }
    return res.status(200).json(prt);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// Edit Party
export const updParty = asyncHandler(async (req, res) => {
  try {
    const prt = await Party.findByIdAndUpdate(
      req.params.id, // FIX: Mongoose expects an ID string here, not an object.
      req.body,
      { new: true }, // exclude file field
    );
    if (!prt) {
      return res.status(404).json({ message: `cannot find any Party id` });
    }
    return res.status(200).json(prt);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// delete a Party
export const delParty = asyncHandler(async (req, res) => {
  try {
    const prt = await Party.findByIdAndDelete(req.params.id); // FIX: Mongoose expects an ID string here, not an object.
    if (!prt) {
      return res.status(404).json({ message: `cannot find any Party id` });
    }
    return res.status(200).json(prt);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});
