_remindDays = OptInt(Param.remind, 5);
arrDates = [];
curDay = Date();
// dayToRemind = DateOffset(DateNewTime(Date()),(-1) * 3600 * 24 *_remindDays);

arrPerson = XQuery(
  "for $elem in collaborators where $elem/is_dismiss=false() and $elem/id=7085089490738561056 return $elem"
);

while (ArrayCount(arrDates) < _remindDays) {
  dayIdx = WeekDay(curDay);

  if (dayIdx != 6 && dayIdx != 0) {
    arrDates.push(curDay);
  }

  curDay = tools.AdjustDate(curDay, -1);
}

dayToRemind = ArrayOptMin(arrDates);

// alert(dayToRemind);

for (elem in arrPerson) {
  lastTimeEntrys = ArrayOptMax(
    XQuery(
      "for $elem in time_entrys where $elem/person_id = " +
        elem.id +
        " return $elem"
    ),
    "OptDate(This.start_date)"
  );

  if (lastTimeEntrys != undefined && lastTimeEntrys.start_date <= dayToRemind) {
    tools.create_notification("88", OptInt(elem.id));
  }
}
