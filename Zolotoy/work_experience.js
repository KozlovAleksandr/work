

function getStage(dob) {
  var now = new Date(); //Текущя дата
  var today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); //Текущя дата без времени
  var dobnow = new Date(today.getFullYear(), dob.getMonth(), dob.getDate()); //ДР в текущем году
  var year;
  var month;
  var day;

  year = today.getFullYear() - dob.getFullYear();
  month = today.getMonth() - dob.getMonth();
  day = today.getDate() - dob.getDate();

  console.log(month)
  if (day < 0) {
    month -= 1;
  }
  console.log(month)

  if (month < 0) {
    year -= 1;
  }

  date = year +" "+ (11+month)


  return date;
}

console.log(getStage(new Date(1990, 0, 26)))
