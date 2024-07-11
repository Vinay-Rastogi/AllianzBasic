const express = require('express');
const router = express.Router();
const Contractor = require('../models/contractor');

router.post('/', async (req, res) => {
  const contractor = new Contractor(req.body);
  try {
    await contractor.save();
    res.status(201).send(contractor);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.get('/',async(req,res) => {
    
  try{
     const contractors = await Contractor.find();
     res.status(200).send(contractors);
  } catch(error){
    console.log(error);
    res.status(400).send(error);
  }
})
router.put('/:id', async (req, res) => {
  try {
    const contractor = await Contractor.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!contractor) {
      return res.status(404).send();
    }
    res.send(contractor);
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;
