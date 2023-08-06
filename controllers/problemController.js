import Problem from '../models/problemModel.js';

export const addProblem = async (req, res, next) => {
  try {
    const newProblem = new Problem({
      ...req.body,
    });
    await newProblem.save();

    return res.status(201).json({ message: 'Kategori berhasil ditambahkan!' });
  } catch (error) {
    next(error);
  }
};

export const getProblems = async (req, res, next) => {
  try {
    const dataProblem = await Problem.find();

    return res.status(200).json(dataProblem);
  } catch (error) {
    next(error);
  }
};

export const updateProblem = async (req, res, next) => {
  const { problemId } = req.params;

  try {
    await Problem.findByIdAndUpdate(problemId, { ...req.body }, { new: true });

    return res.status(200).json({ message: 'Kategori berhasil diupdate!' });
  } catch (error) {
    next(error);
  }
};

export const deleteProblem = async (req, res, next) => {
  const { problemId } = req.params;

  try {
    await Problem.findByIdAndDelete(problemId);

    return res.status(200).json({ message: 'Kategori berhasil dihapus!' });
  } catch (error) {
    next(error);
  }
};
