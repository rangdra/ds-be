import historyModel from '../models/historyModel.js';

export const getHistories = async (req, res, next) => {
  const { userId } = req.query;
  try {
    let where = {};

    if (userId) {
      where = {
        ...where,
        user: userId,
      };
    }
    const dataHistories = await historyModel
      .find(where)
      .populate('user', 'fullname')
      .populate('evidences problem')
      .sort({ createdAt: -1 });

    return res.status(200).json(dataHistories);
  } catch (error) {
    next(error);
  }
};

export const getHistory = async (req, res, next) => {
  const { historyId } = req.params;

  try {
    const history = await historyModel
      .findById(historyId)
      .populate('user', 'fullname')
      .populate('evidences problem');

    return res.status(200).json(history);
  } catch (error) {
    next(error);
  }
};

export const deleteHistory = async (req, res, next) => {
  const { historyId } = req.params;

  try {
    await historyModel.findByIdAndDelete(historyId);

    return res.status(200).json({ message: 'Riwayat berhasil dihapus!' });
  } catch (error) {
    next(error);
  }
};
