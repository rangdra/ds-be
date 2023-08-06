import Pertanyaan from '../models/pertanyaanModel.js';

export const addPertanyaan = async (req, res, next) => {
  try {
    const newPertanyaan = new Pertanyaan({
      ...req.body,
    });
    await newPertanyaan.save();

    return res
      .status(201)
      .json({ message: 'Pertanyaan berhasil ditambahkan!' });
  } catch (error) {
    next(error);
  }
};

export const getPertanyaans = async (req, res, next) => {
  try {
    const dataPertanyaan = await Pertanyaan.find().populate({
      path: 'id_evidence',
    });

    return res.status(200).json(dataPertanyaan);
  } catch (error) {
    next(error);
  }
};

export const updatePertanyaan = async (req, res, next) => {
  const { pertanyaanId } = req.params;

  try {
    await Pertanyaan.findByIdAndUpdate(
      pertanyaanId,
      { ...req.body },
      { new: true }
    );

    return res.status(200).json({ message: 'Pertanyaan berhasil diupdate!' });
  } catch (error) {
    next(error);
  }
};

export const deletePertanyaan = async (req, res, next) => {
  const { pertanyaanId } = req.params;

  try {
    await Pertanyaan.findByIdAndDelete(pertanyaanId);

    return res.status(200).json({ message: 'Pertanyaan berhasil dihapus!' });
  } catch (error) {
    next(error);
  }
};
