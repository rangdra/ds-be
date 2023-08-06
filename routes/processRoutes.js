import express from 'express';
import userModel from '../models/userModel.js';
import evidenceModel from '../models/evidenceModel.js';
import problemModel from '../models/problemModel.js';
import historyModel from '../models/historyModel.js';
import ruleModel from '../models/ruleModel.js';
import { createError } from '../utils/error.js';
const router = express.Router();

router.post('/', async (req, res, next) => {
  // example value req.body.evidences
  // {
  //   "evidences": [6469d97ecdd5e339eba63336, 6469d996cdd5e339eba63338, 6469d9adcdd5e339eba6333a, 6469d9c4cdd5e339eba6333c] // Array dari evidence
  // }
  let evidences = req.body.evidences;
  let mhsId = req.body.mhsId;

  const evidence = [];
  if (!evidences || evidences.length < 2) {
    return next(
      createError(
        404,
        'Minimal 2 jawaban yang bernilai YA untuk lanjut ke identifikasi'
      )
    );
  } else {
    //Select Evidence
    for (let i = 0; i < evidences.length; i++) {
      const ev = await ruleModel
        .find({
          id_evidence: evidences[i],
        })
        .populate('id_problem');
      let x = [];
      const cf = ev[0]['cf'];
      ev.forEach((element1) => {
        x.push(element1['id_problem']['code']);
      });
      evidence.push([x.toString(), cf]);
    }

    //Menentukan Environment
    const prob = await problemModel.find(
      {},
      {
        code: 1,
        _id: 0,
      }
    );
    let nama = [];
    prob.forEach((element, index) => {
      nama.push(element['code']);
    });

    nama = nama.toString();

    let proses = [];
    //Menentukan densitas
    let densitas_baru = {};
    let urutan = 1;
    while (!(evidence.length == 0)) {
      let densitas1 = Array(2);
      densitas1[0] = evidence.shift();
      densitas1[1] = [nama, 1 - densitas1[0][1]];
      let densitas2 = [];
      if (Object.keys(densitas_baru).length == 0) {
        densitas2[0] = evidence.shift();
      } else {
        for (let key in densitas_baru) {
          if (key != '&theta;') {
            densitas2.push([key, densitas_baru[key]]);
          }
        }
      }

      let theta = 1;
      densitas2.forEach((element) => {
        theta -= element[1];
      });

      densitas2.push([nama, theta]);
      const m = densitas2.length;
      densitas_baru = {};
      for (let y = 0; y < m; y++) {
        for (let x = 0; x < 2; x++) {
          if (!(y == m - 1 && x == 1)) {
            let v = densitas1[x][0].split(',');
            let w = densitas2[y][0].split(',');
            v.sort();
            w.sort();
            const vw = v.filter((value) => w.includes(value));
            let k = '';
            if (vw.length == 0) {
              k = '&theta;';
            } else {
              k = vw.toString();
            }
            if (!densitas_baru.hasOwnProperty(k)) {
              densitas_baru[k] = densitas1[x][1] * densitas2[y][1];
            } else {
              densitas_baru[k] += densitas1[x][1] * densitas2[y][1];
            }
          }
        }
      }
      for (let key in densitas_baru) {
        if (key != '&theta;') {
          if (densitas_baru.hasOwnProperty('&theta;')) {
            densitas_baru[key] =
              densitas_baru[key] / (1 - densitas_baru['&theta;']);
          } else {
            densitas_baru[key] = densitas_baru[key] / 1;
          }
        }
      }
      console.log('Proses ' + urutan);
      console.log('densitas baru', densitas_baru);
      proses.push({
        proses: urutan,
        perhitungan: densitas_baru,
      });
      urutan++;
    }

    //Penghapusan

    let fix = {};
    for (let x in densitas_baru) {
      if (x == '&theta;') {
        continue;
      } else {
        fix[x] = densitas_baru[x];
      }
    }

    //Rangking 1
    let maximum = -99999;
    let indexmaks = '';
    for (let key in densitas_baru) {
      if (densitas_baru[key] > maximum) {
        maximum = densitas_baru[key];
        indexmaks = key;
      }
    }

    function renderTextProblem(data) {
      if (!Array.isArray(data)) {
        console.log('Data harus berupa array');
        return;
      }

      const length = data.length;
      if (length === 0) {
        return '';
      }

      let result = data[0].name;
      for (let i = 1; i < length; i++) {
        if (i === length - 1) {
          result += ' dan ' + data[i].name;
        } else {
          result += ', ' + data[i].name;
        }
      }

      return result;
    }

    //Hasil
    let problemname = '';
    let msg = '';
    let mhs;
    // let evidencesRes;
    let problem;

    let arrKeyIdx = indexmaks.split(',');
    try {
      // mhs = await mahasiswaModel.findById(mhsId);
      mhs = await userModel.findById(mhsId);
      if (!mhs) {
        return next(createError(404, 'Mahasiswa tidak ditemukan!'));
      }
      // evidencesRes = await evidenceModel.find({ _id: { $in: evidences } });
      problemname = await problemModel.find(
        { code: { $in: arrKeyIdx } },
        { name: 1, _id: 0 }
      );
      problem = await problemModel.find({ code: { $in: arrKeyIdx } });

      const renderText2 = (percentage, name, problemname) => {
        return `Persentase yang dihasilkan sebesar <b>${
          percentage || 0
        }%</b> maka mahasiswa atas nama <b>${name || ''}</b> berpotensi ${
          Array.isArray(problemname) ? 'diantara' : ''
        } <b>${
          Array.isArray(problemname)
            ? renderTextProblem(problemname || [])
            : problemname
        }</b> untuk drop out`;
      };

      if (problemname.length === 1) {
        msg = renderText2(
          (maximum * 100).toFixed(0),
          mhs.fullname,
          problemname[0]?.name
        );
      }

      if (problemname.length > 1) {
        msg = renderText2(
          (maximum * 100).toFixed(0),
          mhs.fullname,
          problemname
        );
      }

      if (problemname.length === 0) {
        msg = renderText2((maximum * 100).toFixed(0), mhs.fullname);
      }
    } catch (err) {
      problemname = '';

      // msg =
      //   'Penyakit tidak terdeteksi dengan derajat kepercayaan ' +
      //   (maximum * 100).toFixed(0) +
      //   '%';
      // msg = `Mahasiswa <b>${mhs.fullname}</b> untuk drop out
      //  dengan derajat kepercayaan ${(maximum * 100).toFixed(0)}%`;

      msg = renderText2((maximum * 100).toFixed(0), mhs.fullname);
    }

    const resEvidences = await evidenceModel.find({ _id: { $in: evidences } });

    let data = {
      user: mhsId,
      payload: msg,
      result: fix,
      proses,
      evidences: resEvidences,
      problem,
      percentage: (maximum * 100).toFixed(0),
    };

    const newHistory = new historyModel({
      ...data,
    });

    await newHistory.save();

    const history = await historyModel
      .findById(newHistory._doc._id)
      .populate('user', 'fullname');

    return res.status(200).json(history);
  }
});

export default router;
