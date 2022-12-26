function countTasksTime (tsks, command) {
    totalPlanTime = 0;
    totalFactTime = 0;
    switch (command) {
        case 'plan':
            for (tsk in tsks) {
                totalPlanTime += tsk.value;
            }
            return totalPlanTime;
        case 'fact':
            for (tsk in tsks) {
                timeEntries = ArraySelectAll(XQuery('for $ten in time_entrys where $ten/task_id = '+ tsk.id +' return $ten'));
                if (ArrayCount(timeEntries) > 0) {
                    for (te in timeEntries) {
                        totalFactTime += te.duration;
                    }
                }                
            }
            return totalFactTime;
    }
}

groupID = 7181377446826159478;
prjcts = ArraySelectAll(XQuery('for $prj in projects where $prj/group_id = '+ groupID +' return $prj'));

for (prj in prjcts) {
    projectDoc = tools.open_doc(OptInt(prj.id));
    projecTE = projectDoc.TopElem;

    tsks = ArraySelectAll(XQuery('for $tsk in tasks where $tsk/source_object_id = '+ prj.id +' return $tsk'));

    estimate_of_time = projecTE.custom_elems.ObtainChildByKey('estimate_of_time').value;
    planTime = estimate_of_time != '' ? estimate_of_time : countTasksTime(tsks, 'plan');
    factTime = countTasksTime(tsks, 'fact');

    prjctMngr = ArrayOptFirstElem(XQuery('for $prjM in project_participants where $prjM/project_id = '+ prj.id +' and $prjM/boss_type_id = 5999489724832892650 return $prjM'));

    if ((OptInt(factTime) <= OptInt(planTime)) && prjctMngr != undefined) {
        isNotified = projecTE.custom_elems.ObtainChildByKey('notified').value;

        if (isNotified == 'false') {
            tools.create_notification('notification_exceeding_planned_time', OptInt(prjctMngr.object_id), '', OptInt(prj.id));
            projecTE.custom_elems.ObtainChildByKey('notified').value = true;
            projectDoc.Save();
        }
    }
}
