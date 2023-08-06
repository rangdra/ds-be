const validation = (fullname, username, password) => {
  if (!fullname) {
    return 'Nama tidak boleh kosong';
  } else if (fullname.length < 5) {
    return 'Nama minimal 5 karakter';
  }

  if (!username) {
    return 'Nama pengguna tidak boleh kosong';
  } else if (username.replace(/ /g, '').toLowerCase().length < 4) {
    return 'Nama pengguna minimal 4 karakter';
  }

  // if (!email) {
  //   return 'Email tidak boleh kosong';
  // } else if (!validateEmail(email)) {
  //   return 'Email tidak valid!';
  // }

  if (!password) {
    return 'Password tidak boleh kosong';
  } else if (password.length < 5) {
    return 'Password minimal 5 karakter';
  }
};

function validateEmail(email) {
  var re = /\S+@\S+\.\S+/;
  return re.test(email);
}

export default validation;
