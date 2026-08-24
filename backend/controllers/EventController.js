// import dependencies
import Event from "../models/EventModel.js";
import asyncHandler from "express-async-handler";

// Add  Event
export const setEvent = asyncHandler(async (req, res) => {
  try {
    const evt = new Event(req.body);
    const saved = await evt.save();
    if (!saved) {
      res.status(404);
      throw new Error(`cannot add any Event`);
    }
    res.status(200).json(saved);
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
});

// get all evts
export const getEvent = asyncHandler(async (req, res) => {
  try {
    const evt = await Event.find().sort({
      createdAt: -1,
      updatedAt: -1,
      name: -1,
      model: -1,
      start: -1,
    });
    if (!evt) {
      res.status(404);
      throw new Error(`cannot find any Event`);
    }
    res.status(200).json(evt);
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
});

// get a Event by id
export const getEventById = asyncHandler(async (req, res) => {
  try {
    const evt = await Event.findById(req.params.id); // FIX: Removed .sort() as findById returns a single document
    if (!evt) {
      res.status(404);
      throw new Error(`cannot find any Event id`);
    }
    res.status(200).json(evt);
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
});

// get a Event by key
export const getEventByKey = asyncHandler(async (req, res) => {
  try {
    const evt = await Event.find({
      $or: [
        {
          name: {
            $regex: req.params.key,
          },
        },
        {
          address: {
            $regex: req.params.key,
          },
        },
        {
          desc: {
            $regex: req.params.key,
          },
        },
      ],
    }).sort({ createdAt: -1, updatedAt: -1, name: -1, model: -1, start: -1 });
    if (!evt) {
      res.status(404);
      throw new Error(`cannot find any Event id`);
    }
    res.status(200).json(evt);
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
});

// Edit Event
export const updEvent = asyncHandler(async (req, res) => {
  try {
    const evt = await Event.findByIdAndUpdate(
      req.params.id, // FIX: Passed ID string directly instead of an object to prevent CastError
      req.body,
      { new: true }, // exclude file field
    );
    if (!evt) {
      res.status(404);
      throw new Error(`cannot find any Event id`);
    }
    res.status(200).json(evt);
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
});

// delete a Event
export const delEvent = asyncHandler(async (req, res) => {
  try {
    const evt = await Event.findByIdAndDelete(req.params.id); // FIX: Passed ID string directly instead of an object to prevent CastError
    if (!evt) {
      res.status(404);
      throw new Error(`cannot find any Event id`);
    }
    res.status(200).json(evt);
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
});
