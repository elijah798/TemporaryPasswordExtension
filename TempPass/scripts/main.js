// popup.js
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('generatePasswordButton').addEventListener('click', function() {
        console.log('Button clicked');
        generatePassword();
    });
});

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('passwordInput').addEventListener('click', function() {
        console.log('Copy button clicked');
        copyPassword();
    });
}
);

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('historyButton').addEventListener('click', function() {
        console.log('History button clicked');
        if (document.getElementById("historyContainer").classList.contains("hidden")) {
            showHistory();
            document.getElementById("historyContainer").classList.add("hist-container");
            document.getElementById("historyContainer").classList.remove("hidden");
        }else{
            document.getElementById("historyContainer").classList.remove("hist-container");
            document.getElementById("historyContainer").classList.add("hidden");
        }

    });

    document.getElementById('clearHistory').addEventListener('click', function() {
        chrome.storage.local.set({passwordHistory: []}, function() {
            console.log('History cleared');
        });
        document.getElementById("historyContainer").classList.remove("hist-container");
        document.getElementById("historyContainer").classList.add("hidden");
    });

    chrome.storage.onChanged.addListener(function(changes, namespace) {
        if (changes.passwordHistory) {
            showHistory();
        }
    });
}
);


document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('settingsButton').addEventListener('click', function() {
        if (document.getElementById("settings-container").classList.contains("hidden")) {
            document.getElementById("settings-container").classList.add("setting-container");
            document.getElementById("settings-container").classList.remove("hidden");
        }else{
            document.getElementById("settings-container").classList.remove("setting-container");
            document.getElementById("settings-container").classList.add("hidden");

        }
    });

    chrome.storage.local.get({settings: {length,count}}, function(data) {
        document.getElementById('length').value = data.settings.length;
        document.getElementById('count').value = data.settings.count;
    });

    document.getElementById('save-btn').addEventListener('click', function() { 
        let length = document.getElementById('length').value;
        let count = document.getElementById('count').value;
        let settings = {length, count};
        chrome.storage.local.set({settings: settings}, function() {
            console.log('Settings saved');
        });
        document.getElementById("settings-container").classList.remove("setting-container");
        document.getElementById("settings-container").classList.add("hidden");
    });
}
);


const showHistory = () => {
    chrome.storage.local.get({passwordHistory: []}, function(data) {
        let history = data.passwordHistory;
        let historyList = document.getElementById("passwordList");
        historyList.innerHTML = '';
        history.forEach((password) => {
            let listItem = document.createElement("p");
            listItem.textContent = password;
            historyList.appendChild(listItem);
        });

    });
};


const copyPassword = () => {
    let password = document.getElementById("passwordInput");
    password.select();
    password.setSelectionRange(0, 99999);
    document.execCommand('copy');
    console.log('Password copied:', password.value);
};

const convertArrayToCamelCase = (array) => {
    return array.map((word, index) => {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }).join('');
};

const getPassword = async () => {
    let password = '';
    const settings = await new Promise((resolve, reject) => {
        chrome.storage.local.get({settings: {length: 4, count: 3}}, function(data) {
            resolve(data.settings);
        });
    });

    try {
        let wordResponse = await fetch(`https://random-word-api.vercel.app/api?words=${settings.count}&length=${settings.length}`);
        let wordData = await wordResponse.json();
        password = convertArrayToCamelCase(wordData);
        let numberResponse = await fetch('https://www.random.org/integers/?num=1&min=1&max=100&col=1&base=10&format=plain&rnd=new');
        let numberData = await numberResponse.text();
        password += numberData;
    } catch (error) {
        console.error('Error fetching data:', error);
    }
    return password;
};

async function saveHistory(password) {
        chrome.storage.local.get({passwordHistory: []}, function(data) {
            let history = data.passwordHistory;
            history.push(password);
            chrome.storage.local.set({passwordHistory: history}, function() {
                console.log('Password saved');
            });
        });

}


async function generatePassword() {
    var password = await getPassword();
    saveHistory(password);
    document.getElementById("passwordInput").value = password;
    document.getElementById("passwordInput").classList.add("pass-container");
    document.getElementById("passwordInput").classList.remove("hidden");
}