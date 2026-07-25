document.addEventListener("DOMContentLoaded",function(){
    const searchButton = document.getElementById("search-btn");
    const usernameinput = document.getElementById("user-input");
    const statsContainer = document.querySelector(".stats-container");
    const easyProgressCircle = document.querySelector(".easy-progress");
    const mediumProgressCircle = document.querySelector(".medium-progress");
    const hardProgressCircle = document.querySelector(".hard-progress");
    const easyLabel = document.getElementById("easy-label");
    const mediumLabel = document.getElementById("medium-label");
    const hardLabel = document.getElementById("hard-label");
    const cardStatsContainer = document.querySelector(".stats-cards");

    function validateUsername(username) {
    username = username.trim();

    if (username === "") {
        alert("Username should not be empty.");
        return false;
    }

    const regex = /^[a-zA-Z0-9_-]{3,20}$/;
    const isMatching = regex.test(username);

    if (!isMatching) {
        alert("Invalid Username!\nUsername can contain only letters, numbers, '_' and '-'.");
    }

    return isMatching;
}

    async function fetchUserDetails(username){

        const targetUrl = "https://proxy.cors.sh/https://leetcode.com/graphql";
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        try{
            searchButton.textContent = "searching...";
            searchButton.disabled = true;
            statsContainer.style.display = "none";
            cardStatsContainer.hidden = true;

            // const response = await fetch(url);
            //  const proxyUrl = 'https://cors-anywhere.herokuapp.com/'
             const graphql = JSON.stringify({
        query: `
            query userSessionProgress($username: String!) {
                allQuestionsCount {
                    difficulty
                    count
                }

                matchedUser(username: $username) {
                    submitStats {
                        acSubmissionNum {
                            difficulty
                            count
                            submissions
                        }

                        totalSubmissionNum {
                            difficulty
                            count
                            submissions
                        }
                    }
                }
            }
        `,
        variables: {
            username : username
        }
    })
    const requestOption = {
        method : "POST",
        headers : myHeaders,
        body : graphql,
        redirect : "follow"
    };
    const response = await fetch(targetUrl,requestOption);
            if(!response.ok){
                throw new Error("Unable to fetch the user details");
            }
           const parsedData = await response.json();
            console.log("Logging data: ",parsedData)
            console.log(parsedData.data.matchedUser);

            displayUserData(parsedData);
        }
        catch(error){
            console.error(error);

            statsContainer.style.display = "none";
            cardStatsContainer.hidden = true;

            alert("No data found");
        }
        finally{
            searchButton.textContent = "Search";
            searchButton.disabled = false;

        }
}
   
    function updateProgress(solved,total,label,circle){
        const progressDegree = (solved/total)*100;
        circle.style.setProperty("--progress-degree", `${progressDegree}%`);
        label.textContent = `${solved}/${total}`
    }

    function displayUserData(parsedData){
        statsContainer.style.display = "block";
        cardStatsContainer.hidden = false;
        const totalQues = parsedData.data.allQuestionsCount[0].count;
        const totalEasyQues = parsedData.data.allQuestionsCount[1].count;
        const totalMediumQues = parsedData.data.allQuestionsCount[2].count;
        const totalHardQues = parsedData.data.allQuestionsCount[3].count;

        const solvedTotalQues = parsedData.data.matchedUser.submitStats.acSubmissionNum[0].count;
        const solvedTotalEasyQues = parsedData.data.matchedUser.submitStats.acSubmissionNum[1].count;
        const solvedTotalMediumQues = parsedData.data.matchedUser.submitStats.acSubmissionNum[2].count;
        const solvedTotalHardQues = parsedData.data.matchedUser.submitStats.acSubmissionNum[3].count;

        updateProgress(solvedTotalEasyQues,totalEasyQues,easyLabel,easyProgressCircle);
        updateProgress(solvedTotalMediumQues,totalMediumQues,mediumLabel,mediumProgressCircle);
        updateProgress(solvedTotalHardQues,totalHardQues,hardLabel,hardProgressCircle);

        
        const cardData = [
            {
                label: "Overall Submissions",
                value: parsedData.data.matchedUser.submitStats.totalSubmissionNum[0].submissions
            },
            {
                label: "Overall Easy Submissions",
                value: parsedData.data.matchedUser.submitStats.totalSubmissionNum[1].submissions
            },
            {
                label: "Overall Medium Submissions",
                value: parsedData.data.matchedUser.submitStats.totalSubmissionNum[2].submissions
            },
            {
                label: "Overall Hard Submissions",
                value: parsedData.data.matchedUser.submitStats.totalSubmissionNum[3].submissions
            }
        ];

        cardStatsContainer.innerHTML = cardData.map(data => 
            `<div class="card">
               <h4>${data.label}</h4>
               <p>${data.value}</p>
            </div>
        `).join("");    

    }

    searchButton.addEventListener('click', function () {
    const username = usernameinput.value;
    if(!validateUsername(username)){
        return;
    }
    fetchUserDetails(username);
    })
});