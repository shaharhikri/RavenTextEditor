let currentUserId = 'Users/1-A';
let docsDict = new Map();
const filename = document.getElementById('filename');
const revisionsCombobox = document.getElementById('revisions');
const saveBtn = document.getElementById('save-btn');
const output = document.getElementById('output');
const filesCombobox = document.getElementById('files');
const buttons = document.getElementsByClassName('tool--btn');

/* TODO (multiple users): use jwt, pass the user token as an header in each http request,
also remove passing userId ('currentUserId') on each http request)
(for authorizeion) */

for (let btn of buttons) {
    btn.addEventListener('click', () => {
        let cmd = btn.dataset['command'];
        if (cmd === 'createlink') {
            let url = prompt("Enter the link here: ", "http:\/\/");
            document.execCommand(cmd, false, url);
        } else {
            document.execCommand(cmd, false, null);
        }
    })
}


async function renderDocs() {
    let res = await fetch('/text-editor/get-documents-metadata', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId: currentUserId })
    })
    if (res.status == 200) {
        let files = (await res.json()).docs;
        for (n of files) {
            item = document.createElement('option');
            item.value = n.docName;
            item.innerHTML = n.docName;
            docsDict.set(n.docName, n.id);
            filesCombobox.appendChild(item);
        }
    }
    else {
        console.log(res.status)
        console.log(res)
    }
}
renderDocs();

async function renderRevisions() {
    removeOptions(revisionsCombobox);
    var docName = filename.value;
    var docId = docsDict.get(docName);

    let res = await fetch('/text-editor/get-revisions-metadata?docId='+encodeURIComponent(docId), {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    if (res.status == 200) {
        let files = (await res.json()).revisionsMetadata;
        for (n of files) {
            var str = n.date + " " + n.cv;
            
            item = document.createElement('option');
            item.value = str;
            item.innerHTML = str;
            revisionsCombobox.appendChild(item);
        }
    }
    else {
        console.log(res.status)
        console.log(res)
    }
}

async function fileHandle(value) {
    if (value === 'new') {
        output.innerHTML = '';
        filename.value = 'untitled';
        removeOptions(revisionsCombobox);
    }
    else {
        var docId = docsDict.get(value);
        if(docId == undefined){
            console.log("tried to get doc "+value+"which isnt exist on docsDict")
        }

        filename.value = value;
        let res = await fetch('/text-editor/get-document?docId='+encodeURIComponent(docId), {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (res.status == 200) {
            output.innerHTML = (await res.json()).content;
            renderRevisions();
            revisionsCombobox.selectedIndex = 0;
        }
        else {
            console.log(res.status)
            console.log(res)
        }
    }
}

async function revisionsHandle(value) {
    var cv = encodeURIComponent(value.split(' ')[1]);
    let res = await fetch('/text-editor/get-revision?cv='+cv, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    if (res.status == 200) {
        var content =  await res.json();
        output.innerHTML = content;
    }
    else {
        console.log(res.status)
        console.log(res)
    }
}

async function revert() {
    if (revisionsCombobox.options.length > 0) {
        var revisionMetadata = revisionsCombobox.value;
        await save();
        alert("Revert to " + revisionMetadata + " Succeeded");
    }
    else {
        alert("You cant revert in a file you didnt saved");
    }
}

async function save() {
    let markdownText = output.innerHTML
    let docName = filename.value;
    let docId = docsDict.get(docName);
    let requestBody = {
        docId: docId,
        userId: currentUserId,
        docName: docName,
        content: markdownText
    }
    // Send a request to the server to save the document
    let res = await fetch('/text-editor/save-document', {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
    });
    if (res.status == 200) {
        alert('Saved successfully.');
        if(docId==undefined){
            docId = (await res.json()).docId;
            docsDict.set(docName, docId);
            item = document.createElement('option');
            item.value = docName;
            item.innerHTML = docName;
            filesCombobox.appendChild(item)
        }
        renderRevisions();
    }
    else
        alert('Save fail');
}

function removeOptions(selectElement) {
    var i, L = selectElement.options.length - 1;
    for (i = L; i >= 0; i--) {
        selectElement.remove(i);
    }
}