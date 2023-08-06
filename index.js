import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import Problem from './models/problemModel.js';
import Rule from './models/ruleModel.js';
import connectDB from './configs/connectDB.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import problemRoutes from './routes/problemRoutes.js';
import evidenceRoutes from './routes/evidenceRoutes.js';
import mahasiswaRoutes from './routes/mahasiswaRoutes.js';
import historyRoutes from './routes/historyRoutes.js';
import pertanyaanRoutes from './routes/pertanyaanRoutes.js';
import ruleRoutes from './routes/ruleRoutes.js';
import processRoutes from './routes/processRoutes.js';

import ruleModel from './models/ruleModel.js';
import mahasiswaModel from './models/mahasiswaModel.js';
import userModel from './models/userModel.js';
import problemModel from './models/problemModel.js';
import evidenceModel from './models/evidenceModel.js';
import pertanyaanModel from './models/pertanyaanModel.js';
import { getMahasiswas } from './controllers/mahasiswaController.js';

dotenv.config();

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: '*',
  })
);

app.get('/', (req, res) => {
  res.json({ message: 'API is running' });
});

app.get('/getdata', async function (req, res) {
  const listp = await ruleModel.find().populate('id_problem id_evidence');
  const groupedData = {};
  listp.forEach((item) => {
    const idEvidenceName = item.id_evidence.name;

    // If the idEvidenceName key doesn't exist in groupedData, create an empty array
    if (!groupedData[idEvidenceName]) {
      groupedData[idEvidenceName] = [];
    }

    // Push the item into the corresponding array in groupedData
    groupedData[idEvidenceName].push(item);
  });
  return res.status(200).json(groupedData);
});

app.get('/api/dashboard', async function (req, res, next) {
  try {
    const mhsLength = await userModel.countDocuments({ role: 'mahasiswa' });
    const usersLength = await userModel.countDocuments({ role: 'admin' });
    const probLength = await problemModel.countDocuments({});
    const eviLength = await evidenceModel.countDocuments({});
    // const ruleLength = await ruleModel.countDocuments({});
    const pertanyaanLength = await pertanyaanModel.countDocuments({});

    const dataRule = await Rule.find().populate('id_problem id_evidence');

    // Grouping the data
    const groupedData = dataRule.reduce((result, item) => {
      const evidenceId = item.id_evidence._id;

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

    return res.status(200).json({
      users: usersLength,
      mahasiswa: mhsLength,
      kategori: probLength,
      gejala: eviLength,
      rule: groupedData.length,
      pertanyaan: pertanyaanLength,
    });
  } catch (error) {
    next(error);
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/evidence', evidenceRoutes);
app.use('/api/mahasiswa', mahasiswaRoutes);
app.use('/api/rules', ruleRoutes);
app.use('/api/histories', historyRoutes);
app.use('/api/pertanyaan', pertanyaanRoutes);
app.use('/api/process', processRoutes);

// app.post('/api/process', async (req, res, next) => {
//   // example value req.body.evidences
//   // {
//   //   "evidences": [6469d97ecdd5e339eba63336, 6469d996cdd5e339eba63338, 6469d9adcdd5e339eba6333a, 6469d9c4cdd5e339eba6333c] // Array dari evidence
//   // }
//   let evidences = req.body.evidences;
//   let mhsId = req.body.mhsId;

//   const evidence = [];
//   if (!evidences || evidences.length < 2) {
//     return next(createError(404, 'Pilih minimal 2 gejala'));
//   } else {
//     //Select Evidence
//     for (let i = 0; i < evidences.length; i++) {
//       const ev = await Rule.find({
//         id_evidence: evidences[i],
//       }).populate('id_problem');
//       let x = [];
//       const cf = ev[0]['cf'];
//       ev.forEach((element1) => {
//         x.push(element1['id_problem']['code']);
//       });
//       evidence.push([x.toString(), cf]);
//     }

//     //Menentukan Environment
//     const prob = await Problem.find(
//       {},
//       {
//         code: 1,
//         _id: 0,
//       }
//     );
//     let nama = [];
//     prob.forEach((element, index) => {
//       nama.push(element['code']);
//     });

//     nama = nama.toString();

//     let proses = [];
//     //Menentukan densitas
//     let densitas_baru = {};
//     let urutan = 1;
//     while (!(evidence.length == 0)) {
//       let densitas1 = Array(2);
//       densitas1[0] = evidence.shift();
//       densitas1[1] = [nama, 1 - densitas1[0][1]];
//       let densitas2 = [];
//       if (Object.keys(densitas_baru).length == 0) {
//         densitas2[0] = evidence.shift();
//       } else {
//         for (let key in densitas_baru) {
//           if (key != '&theta;') {
//             densitas2.push([key, densitas_baru[key]]);
//           }
//         }
//       }

//       let theta = 1;
//       densitas2.forEach((element) => {
//         theta -= element[1];
//       });

//       densitas2.push([nama, theta]);
//       const m = densitas2.length;
//       densitas_baru = {};
//       for (let y = 0; y < m; y++) {
//         for (let x = 0; x < 2; x++) {
//           if (!(y == m - 1 && x == 1)) {
//             let v = densitas1[x][0].split(',');
//             let w = densitas2[y][0].split(',');
//             v.sort();
//             w.sort();
//             const vw = v.filter((value) => w.includes(value));
//             let k = '';
//             if (vw.length == 0) {
//               k = '&theta;';
//             } else {
//               k = vw.toString();
//             }
//             if (!densitas_baru.hasOwnProperty(k)) {
//               densitas_baru[k] = densitas1[x][1] * densitas2[y][1];
//             } else {
//               densitas_baru[k] += densitas1[x][1] * densitas2[y][1];
//             }
//           }
//         }
//       }
//       for (let key in densitas_baru) {
//         if (key != '&theta;') {
//           if (densitas_baru.hasOwnProperty('&theta;')) {
//             densitas_baru[key] =
//               densitas_baru[key] / (1 - densitas_baru['&theta;']);
//           } else {
//             densitas_baru[key] = densitas_baru[key] / 1;
//           }
//         }
//       }
//       console.log('Proses ' + urutan);
//       console.log('densitas baru', densitas_baru);
//       proses.push({
//         proses: urutan,
//         perhitungan: densitas_baru,
//       });
//       urutan++;
//     }

//     //Penghapusan

//     let fix = {};
//     for (let x in densitas_baru) {
//       if (x == '&theta;') {
//         continue;
//       } else {
//         fix[x] = densitas_baru[x];
//       }
//     }
//     console.log('fix', fix);

//     //Rangking 1
//     let maximum = -99999;
//     let indexmaks = '';
//     for (let key in densitas_baru) {
//       if (densitas_baru[key] > maximum) {
//         maximum = densitas_baru[key];
//         indexmaks = key;
//       }
//     }

//     //Hasil
//     let problemname = '';
//     let msg = '';
//     let mhs;
//     let evidencesRes;
//     let problem;

//     try {
//       // mhs = await mahasiswaModel.findById(mhsId);
//       mhs = await userModel.findOne({ mahasiswa: mhsId });
//       if (!mhs) {
//         return next(createError(404, 'Mahasiswa tidak ditemukan!'));
//       }
//       evidencesRes = await evidenceModel.find({ _id: { $in: evidences } });
//       problemname = await Problem.findOne(
//         { code: indexmaks },
//         { name: 1, _id: 0 }
//       );
//       problem = await Problem.findOne({ code: indexmaks });
//       // msg =
//       //   'Terdeteksi penyakit ' +
//       //   problemname['name'] +
//       //   ' dengan derajat kepercayaan ' +
//       //   (maximum * 100).toFixed(0) +
//       //   '%';
//       msg = `Mahasiswa <b>${mhs.name}</b> berpotensi <b>${
//         problemname['name']
//       }</b> untuk drop out dengan derajat kepercayaan ${(maximum * 100).toFixed(
//         0
//       )}%`;
//     } catch (err) {
//       problemname = '';
//       // msg =
//       //   'Penyakit tidak terdeteksi dengan derajat kepercayaan ' +
//       //   (maximum * 100).toFixed(0) +
//       //   '%';
//       msg = `Mahasiswa <b>${mhs.fullname}</b> berpotensi untuk drop out
//        dengan derajat kepercayaan ${(maximum * 100).toFixed(0)}%`;
//     }
//     let data = {
//       user: userId,
//       payload: msg,
//       result: JSON.stringify(fix),
//       proses: JSON.stringify(proses),
//       evidences,
//       problem: problem._id,
//     };
//     const newHistory = new historyModel({
//       ...data,
//     });

//     await newHistory.save();

//     const history = historyModel
//       .findById(newHistory._id)
//       .populate('user evidences problem');

//     return res.status(200).json(history);
//   }

//   // Write Code

//   // contoh payload API
//   // {
//   //   payload: `Terdeteksi penyakit ... dengan derajat kepercayaan ..%`
//   // }
// });

app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'Something went wrong!';

  return res.status(status).json({
    success: false,
    status,
    message,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  connectDB();
  console.log(`running on port ${PORT}`);
});

// persentase yang dihasilkan sebesar ..% maka mahasiswa atas nama ... ber potensi
