let inSession = false;
let trialMode = "newTrial";
let trialsCompleted = 0
let currentTrialNum = 0;
let trial;
let session;
let marker;
let sessionTime = 0;
let trialTime = 0;
let markerTime = 0;
let inTrial = false;
let currentSession = {};
let lastSessionEmailed =true;
let notEmailedMessage = "The results of the previous session were not e-mailed. If you start a new session, the previous results will be lost forever.Do you want to delete previous data?";
let sessionTrials = 0;
let sessionEvents = [];
let markersAlreadyCreated = 0;
let emailTOuse =   "example@mail.co.ke";

class App{
    //this method refreshes/updates the app
    static refreshApp(){
        if (inSession) {
            // home screen is visible but the session screen is hidden
            $(".home-screen").hide();
            $(".session-screen").show();

            //set the trials completed
            $("#session-trials-completed").text(trialsCompleted);
        }else{
            $(".home-screen").show();
            $(".session-screen").hide();

            //show the download and email buttons
            if(Object.keys(currentSession).length === 0){
                $(".f-icon").hide();
            }else{
                $(".f-icon").show();
            }
        }



        if (inTrial) {
            //set the markers already created
            $("#markers-already-created").text(markersAlreadyCreated);

            //set the text of the start/stop/next trial button
            $("#trial-control-btn").val("End Trial");

            // enable marker buttons
            $(".session-marker").prop('disabled', false);

            //disable the trial number text input
            $("#trial-number").attr("disabled", 'disabled');

            //disable the end session button
            $("#end-session-btn").attr("disabled", "disabled");

            //enable the measurement input
            $('input[name="measurement"]').removeAttr("disabled");
        }else{
            if(trialMode == "newTrial"){
                //enable the trial number text input
                $("#trial-number").attr("disabled", false);
            }

            // disable marker buttons
            $(".session-marker").prop('disabled', true);

            //set the text of the start/stop/next trial button
            if (trialMode == "nextTrial") {
                $("#trial-control-btn").val("Next Trial");
            }
            else if(trialMode == "newTrial"){
                $("#trial-control-btn").val("Start Trial");
            }
        }

        switch (trialMode) {
            case "newTrial":
                //enable the end session button
                $("#end-session-btn").attr("disabled", false);

                //disable the measurement input
                $('input[name="measurement"]').attr("disabled", "disabled");
                break;
            
            case "inTrial":
                //disable the end session button
                $("#end-session-btn").attr("disabled", true);

                //enable the measurement input
                $('input[name="measurement"]').removeAttr("disabled");
            break;

            case "trialEnded":
                //disable the end session button
                $("#end-session-btn").attr("disabled", true);

                //enable the measurement input
                $('input[name="measurement"]').removeAttr("disabled");
                break;
        }

        if(markersAlreadyCreated > 0)
        {
            $("#markers-section").show();
        }
        else{
            $("#markers-section").hide();
        }
    }

    startSession(){
        //reset the sessionevents
        sessionEvents = [];

        //check if last session details were emailed
        if (!lastSessionEmailed) {
            if (!window.confirm(notEmailedMessage)) {
                return;
            }
        }

        //set the details of the current session
        currentSession = {
            subjectId : $("#subject-id").val(),
            description : $("#description").val(),
            autoNumberTrials : $("#auto-number-trials").is(':checked'),
        }

        if(currentSession.autoNumberTrials == true) {
            currentTrialNum = 1;
        }

        //set text markers of the markers in session screen
        $("#marker-s-1").val($("#marker-h-1").val());
        $("#marker-s-2").val($("#marker-h-2").val());
        $("#marker-s-3").val($("#marker-h-3").val());
        $("#marker-s-4").val($("#marker-h-4").val());
        $("#trial-number").val(currentTrialNum);

        inSession = true;
        session = setInterval(this.countSessionTime, 100);
        App.refreshApp();
    }

    static endSession(){
        //check that no ongoing trial
        if (!inTrial) {
            inSession = false;

            //set thet session details are not saved
            lastSessionEmailed = false;

            //reset the session Time
            sessionTime = 0;

            clearInterval(session);

            //reset the home screen form
            $("#home-screen-form").trigger("reset");

            this.refreshApp();
        }
    }

    //sends the session details to email
    sendSessionMail(){

        //download the files first
        this.downloadSession();

        //create a href element that opens the mail
        var hiddenElement2 = document.createElement('a');  
        hiddenElement2.href = 'mailto:' + emailTOuse + '?subject=' + currentSession.subjectId + "&body=" + currentSession.description; 
        
        hiddenElement2.target = '_blank'; 

        hiddenElement2.click();

    }

    //downloads the session details
    downloadSession(){
        //add header to the csv file details
        let sessionEventsDetails = 
            "trial_id,event_type,marker_type,marker_text,time_in_trial,time_in_session,date,time\n";

        //merge the data with CSV  
        sessionEvents.forEach(function(row) {  
            sessionEventsDetails += row.join(',');  
            sessionEventsDetails += "\n";  
        });

        var hiddenElement = document.createElement('a');  
        hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(sessionEventsDetails);  
        hiddenElement.target = '_blank';  
        
        //provide the name for the CSV file to be downloaded  
        hiddenElement.download = currentSession.subjectId +'_trial_details.csv';  
        hiddenElement.click();



        //add header to the csv file details
        let sessionCsvDetails = 
            "subjectId,description\n";
        
        let sessionDetails = [currentSession.subjectId, currentSession.description];

        sessionCsvDetails += sessionDetails.join(',');
        sessionCsvDetails += "\n";

        var hiddenElement2 = document.createElement('a');  
        hiddenElement2.href = 'data:text/csv;charset=utf-8,' + encodeURI(sessionCsvDetails);  
        hiddenElement2.target = '_blank';  
        
        //provide the name for the CSV file to be downloaded  
        hiddenElement2.download = currentSession.subjectId +'_details.csv';  
        hiddenElement2.click();

        
        lastSessionEmailed = true;
    }

    //start a trial
    startTrial(){
        //reset measurement
        $("#measurement-ok").prop("checked", true);

        if(!currentSession.autoNumberTrials)
        {
            //check that trial number if filled 
            if($("#trial-number").val() == "" || $("#trial-number").val() == 0)
            {
                alert("Trial number cannot be empty or zero. Please enter a positive integer");
                return;
            }
        }

        inTrial = true;
        trialMode = "inTrial";

        let today = new Date();

        //create new event of type start
        let event = [
            $("#trial-number").val(),
            "start",
            "",
            "",
            trialTime/10,
            sessionTime/10,
            today.getFullYear() + "-" + (today.getMonth()) + "-" + today.getDate(),
            today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds()
        ]

        sessionEvents.push(event);

        trial = setInterval(this.countTrialTime, 100);
        App.refreshApp();
    }

    endTrial(){
        //check that there is ongoing trial
        if (inTrial) {
            inTrial = false;
            clearInterval(trial);
            clearInterval(marker);

            //set thr trial mode
            trialMode = "nextTrial";
            
            let today = new Date();

            //create new event of type start
            let event = [
                $("#trial-number").val(),
                "stop",
                "",
                "",
                trialTime/10,
                sessionTime/10,
                today.getFullYear() + "-" + (today.getMonth()) + "-" + today.getDate(),
                today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds()
            ]

            sessionEvents.push(event);

            App.refreshApp();
        }
    }

    nextTrial(){
        //check that there is no ongoing trial
        if (!inTrial) {
            //reset marker time
            markerTime = 0;

            //reset the trial time
            trialTime = 0;

            //update the trials trials Completed
            trialsCompleted ++;

            //set the markers already created
            markersAlreadyCreated = 0;

            //set the trial mode
            trialMode = "newTrial";

            $("#trial-time").text("00:00:00");

            if(currentSession.autoNumberTrials == true){
                currentTrialNum = $("#trial-number").val();
                currentTrialNum ++;
                
                $("#trial-number").val(currentTrialNum);
            }else{
                $("#trial-number").val("");
            }

            $("#trial-info").val("");

            App.refreshApp();
        }
    }

    countSessionTime(){
        if (inSession) {
            sessionTime += 1;

            let time = getFormattedTime(sessionTime);

            //show session time
            $("#session-time").html(time);
        }
    }

    countMarkerTime(){
        if (inTrial) {
            markerTime += 1;

            let time = getFormattedTime(markerTime);

            //show marker time
            $("#marker-time").html(time);
        }
    }

    countTrialTime(){
        if (inTrial) {
            trialTime += 1;

            let time = getFormattedTime(trialTime);

            //show trial time
            $("#trial-time").html(time);
        }
    }

}

//when the page loads
document.addEventListener("DOMContentLoaded",()=> {

    const app = new App();

    //update app when page loads
    App.refreshApp();

    
    //when the start session button is clicked
    $("#home-screen-form").submit( e=> {
        e.preventDefault();
        app.startSession();
    } )

    // enable marker buttons
    $(".session-marker").prop('readonly', true);

    //when the end session button is clicked
    $("#end-session-btn").click( e=> {
        e.preventDefault();
        App.endSession();
    } )

    //when the start trial button is clicked
    $("#session-screen-form").submit( e=> {
        e.preventDefault();

        if(!inTrial && trialMode == "newTrial"){
            app.startTrial();
        }
        else if(inTrial && trialMode == "inTrial"){
            app.endTrial();
        }
        else if(!inTrial && trialMode == "nextTrial"){
            app.nextTrial();
        }

    } )

    //when the session marker is clicked
    $(".session-marker").click(e => {
        //get the marker number
        let markerNumber = e.target.dataset.markernum;

        //set the marker number
        $("#marker-num").text(markerNumber);

        if (inTrial) {
            //create new event of type start
            let today = new Date();

            let event = [
                $("#trial-number").val(),
                "marker",
                markerNumber,
                e.target.value,
                trialTime/10,
                sessionTime/10,
                today.getFullYear() + "-" + (today.getMonth()) + "-" + today.getDate(),
                today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds()
            ]

            markersAlreadyCreated++;

            //end previous marker timing
            clearInterval(marker);

            //reset marker time
            markerTime = 0;

            //start markert timing
            marker = setInterval(app.countMarkerTime, 100);

            //set the session time that the marker was clicked
            $("#marker-session-time").html(getFormattedTime(sessionTime));

            sessionEvents.push(event);

            //refresh app
            App.refreshApp();
        }
    })

    //when the download button is clicked
    $(".fa-download").click( () => {
        app.downloadSession();
    })

    //when the email button is clicked
    $(".fa-envelope").click( () => {
        app.sendSessionMail();
    })

    const requestWakeLock = async () => {
        try {
      
          const wakeLock = await navigator.wakeLock.request('screen');
      
        } catch (err) {
          // The wake lock request fails - usually system-related, such as low battery.
      
          console.log(`${err.name}, ${err.message}`);
        }
      }
      
      requestWakeLock();
      

})

function getFormattedTime(time){
    let oneSecondMillis = 10;
    let oneHourMillis = oneSecondMillis * 3600;
    let oneMinuteMillis = oneSecondMillis * 60;


    //  no. of hours between two dates
    let hours = Math.floor(time / oneHourMillis);

    //  no. of minutes between two dates
    let mins = Math.floor((time - (hours * oneHourMillis)) / oneMinuteMillis);

    //  no. of seconds between two dates
    let secs = Math.floor((time - ((hours * oneHourMillis) + (mins * oneMinuteMillis))) / oneSecondMillis);

    let mills = Math.floor(time - ((hours * oneHourMillis) + (mins * oneMinuteMillis) + (secs * oneSecondMillis)));


    return mins + ":" + secs + ":" + mills;
}