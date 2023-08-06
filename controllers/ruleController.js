import Rule from '../models/ruleModel.js';
import Pertanyaan from '../models/pertanyaanModel.js';
import pertanyaanModel from '../models/pertanyaanModel.js';

export const addRule = async (req, res, next) => {
  try {
    req.body.data.forEach(async (d) => {
      const newRule = new Rule({
        ...d,
      });
      await newRule.save();
    });

    return res.status(201).json({ message: 'Rule berhasil ditambahkan!' });
  } catch (error) {
    next(error);
  }
};

export const getRules = async (req, res, next) => {
  try {
    const dataRule = await Rule.find()
      .populate('id_problem id_evidence')
      .sort({ createdAt: -1 });

    // Grouping the data
    const groupedData = dataRule.reduce((result, item) => {
      const evidenceId = item.id_evidence._id;
      const problemId = item.id_problem._id;

      // Find the evidence in the result
      const evidence = result.find(
        (group) => group.evidence._id === evidenceId
      );

      if (evidence) {
        // Evidence exists, add the problem to the existing group
        evidence.problems.push(item.id_problem);
      } else {
        // Evidence doesn't exist, create a new group
        result.push({
          _id: item._id,
          evidence: item.id_evidence,
          problems: [item.id_problem],
          cf: item.cf,
        });
      }

      return result;
    }, []);

    // const groupedData = {};
    // dataRule.forEach((item) => {
    //   const evidenceId = item.id_evidence._id;
    //   if (!groupedData[evidenceId]) {
    //     groupedData[evidenceId] = {
    //       evidence: item.id_evidence,
    //       problems: [],
    //     };
    //   }
    //   groupedData[evidenceId].problems.push(item.id_problem);
    // });

    // const result = Object.values(groupedData);

    return res.status(200).json(groupedData);
  } catch (error) {
    next(error);
  }
};

export const updateRule = async (req, res, next) => {
  const { ruleId } = req.params;
  try {
    // req.body.data.forEach(async (d) => {
    //   await Rule.updateMany(
    //     { id_evidence: ruleId },
    //     {
    //       id_evidence: d.id_evidence,
    //       id_problem: d.id_problem,
    //       cf: d.cf,
    //     },
    //     { new: true }
    //   );
    // });

    await Rule.deleteMany({ id_evidence: req.body.data[0].id_evidence });

    req.body.data.forEach(async (d) => {
      const newRule = new Rule({
        ...d,
      });
      await newRule.save();
    });

    return res.status(200).json({ message: 'Rule berhasil diupdate!' });
  } catch (error) {
    next(error);
  }
};

export const deleteRule = async (req, res, next) => {
  const { ruleId } = req.params;

  try {
    await Rule.deleteMany({ id_evidence: ruleId });
    await pertanyaanModel.findOneAndDelete({ rule: ruleId });

    return res.status(200).json({ message: 'Rule berhasil dihapus!' });
  } catch (error) {
    next(error);
  }
};

// [
//   {
//     evidence: {
//         _id: '6469d97ecdd5e339eba63336',
//       code: 'G1',
//       name: 'Sulit untuk disiplin',
//       oldId: 1,
//       createdAt: '2023-05-21T08:42:38.853Z',
//       updatedAt: '2023-05-21T08:42:38.853Z',
//       __v: 0
//     },
//     problems: [
//       {
//           _id: '6469d9efcdd5e339eba6333e',
//       code: 'P1',
//       name: 'Inantentif',
//       oldId: 1,
//       createdAt: '2023-05-21T08:44:31.521Z',
//       updatedAt: '2023-05-21T08:44:31.521Z',
//       __v: 0,
//       },
//       {
//          _id: '6469da02cdd5e339eba63340',
//       code: 'P2',
//       name: 'Hiperaktif',
//       oldId: 2,
//       createdAt: '2023-05-21T08:44:50.184Z',
//       updatedAt: '2023-05-21T08:44:50.184Z',
//       __v: 0,
//       }, {
//   _id: '6469da13cdd5e339eba63342',
//       code: 'P3',
//       name: 'Implusif',
//       oldId: 3,
//       createdAt: '2023-05-21T08:45:07.381Z',
//       updatedAt: '2023-05-21T08:45:07.381Z',
//       __v: 0,
//       }
//     ]
//   }
// ]
// [
//   {
//     _id: '6469dc32f75b56af40f9082c',
//     id_problem: {
//       _id: '6469d9efcdd5e339eba6333e',
//       code: 'P1',
//       name: 'Inantentif',
//       oldId: 1,
//       createdAt: '2023-05-21T08:44:31.521Z',
//       updatedAt: '2023-05-21T08:44:31.521Z',
//       __v: 0,
//     },
//     id_evidence: {
//       _id: '6469d97ecdd5e339eba63336',
//       code: 'G1',
//       name: 'Sulit untuk disiplin',
//       oldId: 1,
//       createdAt: '2023-05-21T08:42:38.853Z',
//       updatedAt: '2023-05-21T08:42:38.853Z',
//       __v: 0,
//     },
//     cf: 0.3,
//     createdAt: '2023-05-21T08:54:10.524Z',
//     updatedAt: '2023-05-21T08:54:10.524Z',
//     __v: 0,
//   },
//   {
//     _id: '6469dc47f75b56af40f9082e',
//     id_problem: {
//       _id: '6469da02cdd5e339eba63340',
//       code: 'P2',
//       name: 'Hiperaktif',
//       oldId: 2,
//       createdAt: '2023-05-21T08:44:50.184Z',
//       updatedAt: '2023-05-21T08:44:50.184Z',
//       __v: 0,
//     },
//     id_evidence: {
//       _id: '6469d97ecdd5e339eba63336',
//       code: 'G1',
//       name: 'Sulit untuk disiplin',
//       oldId: 1,
//       createdAt: '2023-05-21T08:42:38.853Z',
//       updatedAt: '2023-05-21T08:42:38.853Z',
//       __v: 0,
//     },
//     cf: 0.3,
//     createdAt: '2023-05-21T08:54:31.905Z',
//     updatedAt: '2023-05-21T08:54:31.905Z',
//     __v: 0,
//   },
//   {
//     _id: '6469dc59f75b56af40f90830',
//     id_problem: {
//       _id: '6469da13cdd5e339eba63342',
//       code: 'P3',
//       name: 'Implusif',
//       oldId: 3,
//       createdAt: '2023-05-21T08:45:07.381Z',
//       updatedAt: '2023-05-21T08:45:07.381Z',
//       __v: 0,
//     },
//     id_evidence: {
//       _id: '6469d97ecdd5e339eba63336',
//       code: 'G1',
//       name: 'Sulit untuk disiplin',
//       oldId: 1,
//       createdAt: '2023-05-21T08:42:38.853Z',
//       updatedAt: '2023-05-21T08:42:38.853Z',
//       __v: 0,
//     },
//     cf: 0.3,
//     createdAt: '2023-05-21T08:54:49.354Z',
//     updatedAt: '2023-05-21T08:54:49.354Z',
//     __v: 0,
//   },
//   {
//     _id: '6469dc82f75b56af40f90832',
//     id_problem: {
//       _id: '6469d9efcdd5e339eba6333e',
//       code: 'P1',
//       name: 'Inantentif',
//       oldId: 1,
//       createdAt: '2023-05-21T08:44:31.521Z',
//       updatedAt: '2023-05-21T08:44:31.521Z',
//       __v: 0,
//     },
//     id_evidence: {
//       _id: '6469d996cdd5e339eba63338',
//       code: 'G23',
//       name: 'Terlihat sangat pemalu dan menarik diri',
//       oldId: 2,
//       createdAt: '2023-05-21T08:43:02.521Z',
//       updatedAt: '2023-05-21T08:43:02.521Z',
//       __v: 0,
//     },
//     cf: 0.6,
//     createdAt: '2023-05-21T08:55:30.700Z',
//     updatedAt: '2023-05-21T08:55:30.700Z',
//     __v: 0,
//   },
//   {
//     _id: '6469dc94f75b56af40f90834',
//     id_problem: {
//       _id: '6469da13cdd5e339eba63342',
//       code: 'P3',
//       name: 'Implusif',
//       oldId: 3,
//       createdAt: '2023-05-21T08:45:07.381Z',
//       updatedAt: '2023-05-21T08:45:07.381Z',
//       __v: 0,
//     },
//     id_evidence: {
//       _id: '6469d996cdd5e339eba63338',
//       code: 'G23',
//       name: 'Terlihat sangat pemalu dan menarik diri',
//       oldId: 2,
//       createdAt: '2023-05-21T08:43:02.521Z',
//       updatedAt: '2023-05-21T08:43:02.521Z',
//       __v: 0,
//     },
//     cf: 0.6,
//     createdAt: '2023-05-21T08:55:48.281Z',
//     updatedAt: '2023-05-21T08:55:48.281Z',
//     __v: 0,
//   },
//   {
//     _id: '6469dcb8f75b56af40f90836',
//     id_problem: {
//       _id: '6469da13cdd5e339eba63342',
//       code: 'P3',
//       name: 'Implusif',
//       oldId: 3,
//       createdAt: '2023-05-21T08:45:07.381Z',
//       updatedAt: '2023-05-21T08:45:07.381Z',
//       __v: 0,
//     },
//     id_evidence: {
//       _id: '6469d9adcdd5e339eba6333a',
//       code: 'G15',
//       name: 'Sering mengambil mainan teman dengan paksa',
//       oldId: 3,
//       createdAt: '2023-05-21T08:43:25.390Z',
//       updatedAt: '2023-05-21T08:43:25.390Z',
//       __v: 0,
//     },
//     cf: 0.4,
//     createdAt: '2023-05-21T08:56:24.651Z',
//     updatedAt: '2023-05-21T08:56:24.651Z',
//     __v: 0,
//   },
//   {
//     _id: '6469dcdcf75b56af40f90838',
//     id_problem: {
//       _id: '6469da13cdd5e339eba63342',
//       code: 'P3',
//       name: 'Implusif',
//       oldId: 3,
//       createdAt: '2023-05-21T08:45:07.381Z',
//       updatedAt: '2023-05-21T08:45:07.381Z',
//       __v: 0,
//     },
//     id_evidence: {
//       _id: '6469d9c4cdd5e339eba6333c',
//       code: 'G19',
//       name: 'Memiliki sikap menantang dan membangkang',
//       oldId: 4,
//       createdAt: '2023-05-21T08:43:48.160Z',
//       updatedAt: '2023-05-21T08:43:48.160Z',
//       __v: 0,
//     },
//     cf: 0.9,
//     createdAt: '2023-05-21T08:57:00.289Z',
//     updatedAt: '2023-05-21T08:57:00.289Z',
//     __v: 0,
//   },
// ];
