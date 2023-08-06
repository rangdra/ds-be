import Evidence from '../models/evidenceModel.js';
import pertanyaanModel from '../models/pertanyaanModel.js';
import Rule from '../models/ruleModel.js';

export const addEvidence = async (req, res, next) => {
  try {
    const newEvidence = new Evidence({
      ...req.body,
    });
    await newEvidence.save();

    return res.status(201).json({ message: 'Kriteria berhasil ditambahkan!' });
  } catch (error) {
    next(error);
  }
};

export const getEvidences = async (req, res, next) => {
  try {
    const dataEvidence = await Evidence.find();

    return res.status(200).json(dataEvidence);
  } catch (error) {
    next(error);
  }
};

export const updateEvidence = async (req, res, next) => {
  const { evidenceId } = req.params;

  try {
    await Evidence.findByIdAndUpdate(
      evidenceId,
      { ...req.body },
      { new: true }
    );

    return res.status(200).json({ message: 'Kriteria berhasil diupdate!' });
  } catch (error) {
    next(error);
  }
};

export const deleteEvidence = async (req, res, next) => {
  const { evidenceId } = req.params;

  try {
    // const rule = await Rule.findOne({ id_evidence: evidenceId });
    await Rule.deleteMany({ id_evidence: evidenceId });
    await pertanyaanModel.findOneAndDelete({
      id_evidence: evidenceId,
    });
    await Evidence.findByIdAndDelete(evidenceId);
    return res.status(200).json({ message: 'Kriteria berhasil dihapus!' });
  } catch (error) {
    next(error);
  }
};
