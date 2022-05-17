(function () {
    let btnAddFolder = document.querySelector("#btnAddFolder");
    let btnAddTextFile = document.querySelector("#btnAddTextFile");
    let btnAddAlbum = document.querySelector("#addAlbum");
    let templates = document.querySelector("#templates");
    let breadCrumbs = document.querySelector("#breadCrumb");
    let divContainer = document.querySelector("#container");
    let aRootPath = breadCrumbs.querySelector("[rid='-1']");
    let divApp = document.querySelector("#app");
    let divAppMenuBar = divApp.querySelector("#app-menu-bar");
    let divAppBody = divApp.querySelector("#app-body");
    let divAppTitleBar = document.querySelector("#app-title-bar");
    let divAppTitle = document.querySelector("#app-title");
    let fileOpened = {
        id: -1,
        state: "closed"
    };

    let resources = [];
    let cfid = -1; //initially we're at root whose fid is -1
    let rid = 0;
    let openFileId = -1;
    btnAddFolder.addEventListener("click", addFolder);
    btnAddTextFile.addEventListener("click", addTextFile);
    btnAddAlbum.addEventListener("click", addAlbum);
    aRootPath.addEventListener("click", viewFolderFromPath);

    // validation - unique name, non- blank, persist to storage and ram
    function addFolder() {
        let rname = prompt("Enter folder's name");
        if (rname != null) {
            rname = rname.trim();
        }
        if (!rname) {
            alert("Empty folder is not allowed. Please enter something");
            return;
        }

        let alreadyExists = resources.some(r => r.name == rname && r.pid == cfid && r.rtype == "folder");
        if (alreadyExists) {
            alert("Folder " + rname + " already exists. Please enter a different name");
            return;
        }
        rid++;
        let pid = cfid;
        addFolderHTML(rname, rid, pid);
        resources.push(
            {
                id: rid,
                name: rname,
                rtype: "folder",
                pid: cfid
            }
        );
        saveToStorage();

    }

    function addFolderHTML(rname, rid, pid) {
        let divFolderTemplate = templates.content.querySelector(".folder");
        let divFolder = divFolderTemplate.cloneNode(true);
        let folderName = divFolder.querySelector("[purpose='name']");

        let spanRename = divFolder.querySelector("[action=rename]");
        let spanView = divFolder.querySelector("[action='view']");
        let spanDelete = divFolder.querySelector("[action='delete']");

        spanRename.addEventListener("click", renameFolder);
        spanView.addEventListener("click", viewFolder);
        spanDelete.addEventListener("click", deleteFolder);

        folderName.textContent = rname;
        divFolder.setAttribute("rid", rid);
        divFolder.setAttribute("pid", pid);

        divContainer.appendChild(divFolder);
        // console.log(fname);
    }

    function addTextFileHTML(rname, rid, pid) {
        let divTextFileTemplate = templates.content.querySelector(".text-file");
        let divTextFile = divTextFileTemplate.cloneNode(true);
        let textFileName = divTextFile.querySelector("[purpose='name']");

        let spanRename = divTextFile.querySelector("[action=rename]");
        let spanView = divTextFile.querySelector("[action='view']");
        let spanDelete = divTextFile.querySelector("[action='delete']");

        spanRename.addEventListener("click", renameTextFile);
        spanView.addEventListener("click", viewTextFile);
        spanDelete.addEventListener("click", deleteTextFile);

        textFileName.textContent = rname;
        divTextFile.setAttribute("rid", rid);
        divTextFile.setAttribute("pid", pid);

        divContainer.appendChild(divTextFile);
    }

    function addAlbumHTML(rname, rid, pid){
        let divAlbumTemplate = templates.content.querySelector(".album");
        let divAlbum = divAlbumTemplate.cloneNode(true);
        let divAlbumName = divAlbum.querySelector("[purpose='name']");
        
        divAlbumName.textContent = rname;
        // console.log(divAlbumName.innerHTML);
        divAlbum.setAttribute("rid", rid);
        divAlbum.setAttribute("pid", pid);
       

        let spanView = divAlbum.querySelector(".actionContainer [action='view']");
        let spanRename = divAlbum.querySelector(".actionContainer [action='rename']");
        let spanDelete = divAlbum.querySelector(".actionContainer [action='delete']");

        spanRename.addEventListener("click", renameAlbum);
        spanView.addEventListener("click", viewAlbum);
        spanDelete.addEventListener("click", deleteAlbum);

        divContainer.appendChild(divAlbum);
    }

    function renameAlbum(){
        let divAlbum = this.parentNode.parentNode;
        let divAlbumName = divAlbum.querySelector("[purpose='name']");
   
        let ridToBeRenamed = parseInt(divAlbum.getAttribute("rid"));

        if(ridToBeRenamed == fileOpened.id && fileOpened.state == "open"){
            alert("This resource is opened currently. Please close it to delete. ");
            return;
        }

     

        let nrname = prompt("Please enter the new name for album " + divAlbumName.textContent);
        if (nrname != null) {
            nrname = nrname.trim();
        }
        if (!nrname) {
            alert("Please enter something");
            return;
        }

        let alreadyExists = resources.some(r => r.name == nrname && r.pid == cfid);
        if(alreadyExists){
            alert("Resource " + nrname + " already exists. Please enter a new name.");
            return;
        }

        //html
        divAlbumName.textContent = nrname;

        //ram
        let resource = resources.find(r => r.id == ridToBeRenamed);
        resource.name = nrname;

        //storage
        saveToStorage();
    }
    function viewAlbum(){
        divApp.style.display = "block";
        let divAlbum = this.parentNode.parentNode;
        let divAlbumName = divAlbum.querySelector("[purpose='name']");

        
        divAppTitle.innerHTML = divAlbumName.textContent;

        let divAlbumMenuTemplate = templates.content.querySelector("[purpose='album-menu']");
        let divAlbumBodyTemplate = templates.content.querySelector("[purpose='album-body']");
        let divAlbumMenu = divAlbumMenuTemplate.cloneNode(true);
        let divAlbumBody = divAlbumBodyTemplate.cloneNode(true);

        divAppMenuBar.innerHTML = '';
        divAppBody.innerHTML = '';
        divAppMenuBar.appendChild(divAlbumMenu);
        divAppBody.appendChild(divAlbumBody);

        let rid = parseInt(divAlbum.getAttribute("rid"));

        divAppTitle.setAttribute("rid", rid);

        fileOpened.id = rid;
        fileOpened.state = "open";


        let divWinActions = divAppTitleBar.querySelector("#win-actions");
        let spanMinimize = divWinActions.querySelector("#minimize");
        let spanMaximize = divWinActions.querySelector("#maximize");
        let spanClose = divWinActions.querySelector("#close");

        spanClose.addEventListener("click", closeApp);
        spanMinimize.addEventListener("click", minimizeApp);
        spanMaximize.addEventListener("click", maximizeApp);
        
        console.log(divAlbumMenu);
    }
    function deleteAlbum(){
        let divAlbum = this.parentNode.parentNode;
        let divAlbumName = divAlbum.querySelector("[purpose='name']");
        let ridToBeDeleted = parseInt(divAlbum.getAttribute("rid"));
        
        if (ridToBeDeleted == fileOpened.id && fileOpened.state == "open") {
            alert("This resource is opened currently. Please close it to delete. ");
            return;
        }

        let confirmDel = confirm(`Are you sure you want to delete album ${divAlbumName.textContent}`);
        if(confirmDel){
            divAlbum.remove();
            let ridx = resources.findIndex(r => r.id == ridToBeDeleted);
            resources.splice(ridx, 1);
            saveToStorage();
        }


    }

    function addTextFile() {
        let rname = prompt("Enter text file's name");
        if (rname != null) {
            rname = rname.trim();
        }
        if (!rname) {
            alert("Empty file name is not allowed. Please enter something");
            return;
        }

        let alreadyExists = resources.some(r => r.name == rname && r.pid == cfid && r.rtype == "text-file");
        if (alreadyExists) {
            alert("File " + rname + " already exists. Please enter a different name");
            return;
        }
        rid++;
        let pid = cfid;
        addTextFileHTML(rname, rid, pid);
        resources.push(
            {
                id: rid,
                name: rname,
                rtype: "text-file",
                pid: cfid,
                isBold: false,
                isItalic: false,
                isUnderline: false,
                bgColor: "#FFFFFF",
                textColor: "#000000",
                fontFamily: "monospace",
                fontSize: 20,
                textArea: "Type here..."
            }
        );
        saveToStorage();
    }

    function addAlbum(){

        let rname = prompt("Enter text album's name");
        if (rname != null) {
            rname = rname.trim();
        }
        if (!rname) {
            alert("Empty album name is not allowed. Please enter something");
            return;
        }

        let alreadyExists = resources.some(r => r.name == rname && r.pid == cfid && r.rtype == "text-file");
        if (alreadyExists) {
            alert("File " + rname + " already exists. Please enter a different name");
            return;
        }
        rid++;
        let pid = cfid;
        addAlbumHTML(rname, rid, pid);
        resources.push(
            {
                id: rid,
                name: rname,
                rtype: "album",
                pid: cfid,
            }
        );
        saveToStorage();
    }



    function deleteFolder() {
        let divFolder = this.parentNode.parentNode;
        let fid = parseInt(divFolder.getAttribute("rid"));
        let folderName = divFolder.querySelector("[purpose='name']");
        let confirmDel = confirm("Are you sure you want to delete folder " + folderName.textContent + " ?");
        if (confirmDel) {

            let innerContentExists = resources.some(r => r.pid == fid);
            if (innerContentExists) {
                let confirmStill = confirm("This folder has content in it. Do you still want to delete? ");
                if (confirmStill) {
                    //remove html
                    divFolder.remove();

                    //remove from ram
                    deleteFolderHelper(fid);
                    // console.log(resources);

                    // remove from storage
                    saveToStorage();
                }
                else {
                    return;
                }
            }
            else {
                //remove html
                divFolder.remove();

                //remove from ram
                deleteFolderHelper(fid);
                console.log(resources);

                // remove from storage
                saveToStorage();
            }

        }

    }
    function deleteFolderHelper(fidTBD) {


        let children = resources.filter(r => r.pid == fidTBD);
        for (let i = 0; i < children.length; i++) {
            deleteFolderHelper(children[i].id);


        }

        let ridx = resources.findIndex(r => r.id == fidTBD);
        resources.splice(ridx, 1);


        // let fidx = resources.findIndex(r => r.id == fidTBD);
        // resources.splice(fidx, 1);


        // console.log(fidTBD);
    }

    function deleteTextFile() {
        // console.log(this.parentNode.parentNode);
        let divTextFile = this.parentNode.parentNode;
        let txtFileIDTBD = parseInt(divTextFile.getAttribute("rid"));



        if (txtFileIDTBD == fileOpened.id && fileOpened.state == "open") {
            alert("This file is opened currently. Please close it to delete. ");
            return;
        }

        // console.log(txtFileIDTBD);
        let textFileName = divTextFile.querySelector("[purpose='name']");

        let confirmTextFileDel = confirm(`Are you sure you want to delete ${textFileName.textContent}?`);
        if (confirmTextFileDel) {
            //delete html
            divTextFile.remove();

            //delete ram
            let resourceIdx = resources.findIndex(r => r.id == txtFileIDTBD);
            resources.splice(resourceIdx, 1);

            //delete storage
            saveToStorage();
        }
    }

    //empty, old, unique
    function renameFolder() {
        let divFolder = this.parentNode.parentNode;
        let folderName = divFolder.querySelector("[purpose='name']");
        // console.log("rename folder " + folderName.textContent);


        let nrname = prompt("Please enter the new name for folder" + folderName.textContent);
        if (nrname != null) {
            nrname = nrname.trim();
        }
        if (!nrname) {
            alert("Please enter something");
            return;
        }
        let ridToBeRenamed = parseInt(divFolder.getAttribute("rid"));

        let orname = folderName.textContent;
        if (nrname == orname) {
            alert("Please enter a different name");
            return;
        }

        let alreadyExists = resources.some(r => r.name == nrname && r.pid == cfid);
        if (alreadyExists) {
            alert("Folder " + nrname + " already exists. Please enter a new name.");
            return;
        }

        //html
        folderName.textContent = nrname;

        //ram
        let resource = resources.find(r => r.id == ridToBeRenamed);
        resource.name = nrname;

        //local storage
        saveToStorage();

    }

    function renameTextFile() {

        let divTextFile = this.parentNode.parentNode;

        let txtFileIDTBD = divTextFile.getAttribute("rid");
        let textFileName = divTextFile.querySelector("[purpose='name']");

        let ridToBeRenamed = parseInt(divTextFile.getAttribute("rid"));

        if (ridToBeRenamed == fileOpened.id && fileOpened.state == "open") {
            alert("This file is opened currently. Please close it to rename. ");
            return;
        }

        let nrname = prompt("Please enter the new name for file" + textFileName.textContent);
        if (nrname != null) {
            nrname = nrname.trim();
        }
        if (!nrname) {
            alert("Please enter something");
            return;
        }




        let alreadyExists = resources.some(r => r.name == nrname && r.pid == cfid);
        if (alreadyExists) {
            alert("File " + nrname + " already exists. Please enter a new name.");
            return;
        }

        //html
        textFileName.textContent = nrname;

        //ram
        let resource = resources.find(r => r.id == ridToBeRenamed);
        resource.name = nrname;

        //local storage
        saveToStorage();
    }

    function viewFolder() {
        let divFolder = this.parentNode.parentNode;
        let folderName = divFolder.querySelector("[purpose='name']");
        let fid = parseInt(divFolder.getAttribute("rid"));

        let aPathTemplate = templates.content.querySelector("[purpose='path']");
        let aPath = aPathTemplate.cloneNode(true);
        aPath.textContent = folderName.textContent;
        aPath.setAttribute("rid", fid);
        breadCrumbs.appendChild(aPath);
        aPath.addEventListener("click", viewFolderFromPath);

        cfid = fid;
        divContainer.innerHTML = "";
        resources.forEach(r => {
            if (r.pid == cfid) {
                if (r.rtype == "folder") {
                    addFolderHTML(r.name, r.id, r.pid);
                }
                else if (r.rtype == "text-file") {
                    addTextFileHTML(r.name, r.id, r.pid);
                }
                else if(r.rtype == "album"){
                    addAlbumHTML(r.name, r.id, r.pid);
                }

            }
        });


    }

    function viewFolderFromPath() {
        // console.log(this);
        let aPath = this;
        let fid = aPath.getAttribute("rid");
        cfid = fid;
        // console.log(cfid);

        while (aPath.nextSibling) {
            aPath.nextSibling.remove();
        }

        divContainer.innerHTML = "";
        resources.forEach(r => {
            if (r.pid == cfid) {
                if (r.rtype == "folder") {
                    addFolderHTML(r.name, r.id, r.pid);
                }
                else if (r.rtype == "text-file") {
                    addTextFileHTML(r.name, r.id, r.pid);
                }
                else if(r.rtype == "album"){
                    addAlbumHTML(r.name, r.id, r.pid);
                }

            }
        });
    }

    function viewTextFile() {


        divApp.style.display = "block";

        let divNotePadMenuTemplate = templates.content.querySelector("[purpose='notepad-menu']");
        // console.log(divNotePadMenuTemplate);
        let divNotePadMenu = divNotePadMenuTemplate.cloneNode(true);
        let divNotePadBodyTemplate = templates.content.querySelector("[purpose='notepad-body']");


        let divNotePadBody = divNotePadBodyTemplate.cloneNode(true);


        divAppMenuBar.innerHTML = '';
        divAppMenuBar.appendChild(divNotePadMenu);
        divAppBody.innerHTML = '';
        divAppBody.appendChild(divNotePadBody);

        let divTextFile = this.parentNode.parentNode;
        let divTextFileName = divTextFile.querySelector("[purpose='name']");
        divAppTitle.textContent = divTextFileName.textContent;
        let fid = parseInt(divTextFile.getAttribute("rid"));
        openFileId = fid;

        fileOpened.id = openFileId;
        fileOpened.state = "open";

        divAppTitle.setAttribute("rid", fid);

        let divWinActions = divAppTitleBar.querySelector("#win-actions");
        let spanMinimize = divWinActions.querySelector("#minimize");
        let spanMaximize = divWinActions.querySelector("#maximize");
        let spanClose = divWinActions.querySelector("#close");

        spanClose.addEventListener("click", closeApp);
        spanMinimize.addEventListener("click", minimizeApp);
        spanMaximize.addEventListener("click", maximizeApp);

        //menu bar events
        let spanSave = divNotePadMenu.querySelector("[action='save']");
        let spanBold = divNotePadMenu.querySelector("[action='bold']");
        let spanItalic = divNotePadMenu.querySelector("[action='italic']");
        let spanUnderline = divNotePadMenu.querySelector("[action='underline']");
        let inputBGColor = divNotePadMenu.querySelector("[action='bg-color']");
        let inputTextColor = divNotePadMenu.querySelector("[action='fg-color']");
        let selectFontFamily = divNotePadMenu.querySelector("[action='font-family']");
        let selectFontSize = divNotePadMenu.querySelector("[action='font-size']");
        let textArea = divAppBody.querySelector("textArea");
        let spanDwonload = divNotePadMenu.querySelector("[action='download']");
        let inputUpload = divNotePadMenu.querySelector("[action='upload']");

        spanSave.addEventListener("click", saveNotePad);
        spanBold.addEventListener("click", makeNotePadBold);
        spanItalic.addEventListener("click", makeNotePadItalic);
        spanUnderline.addEventListener("click", makeNotePadUnderline);

        inputBGColor.addEventListener("change", changeNotePadBGColor);
        inputTextColor.addEventListener("change", changeNotePadTextColor);
        selectFontFamily.addEventListener("change", changeNotePadFontFamily);
        selectFontSize.addEventListener("change", changeNotePadFontSize);
        spanDwonload.addEventListener("click", downloadNotepad);
        inputUpload.addEventListener("change", uploadNotepad);


        let resource = resources.find(r => r.id == fid);
        spanBold.setAttribute("pressed", !resource.isBold);
        spanItalic.setAttribute("pressed", !resource.isItalic);
        spanUnderline.setAttribute("pressed", !resource.isUnderline);
        inputBGColor.value = resource.bgColor;
        inputTextColor.value = resource.textColor;
        selectFontFamily.value = resource.fontFamily;
        selectFontSize.value = resource.fontSize;
        textArea.value = resource.textArea;

        spanMaximize.dispatchEvent(new Event("click"));

        spanBold.dispatchEvent(new Event("click"));
        spanItalic.dispatchEvent(new Event("click"));
        spanUnderline.dispatchEvent(new Event("click"));
        inputBGColor.dispatchEvent(new Event("change"));
        inputTextColor.dispatchEvent(new Event("change"));
        selectFontFamily.dispatchEvent(new Event("change"));
        selectFontSize.dispatchEvent(new Event("change"));

    }

    function downloadNotepad() {

        let divAppMenu = this.parentNode;


        let fid = parseInt(divAppTitle.getAttribute("rid"));
        let resource = resources.find(r => r.id == fid);
        let resourceJSON = JSON.stringify(resource);

        let aDownload = document.createElement('a');

        let data = "text/json;charset=utf-8," + encodeURIComponent(resourceJSON);
        aDownload.setAttribute('href', `data:${data}`);


        aDownload.setAttribute('download', `${resource.name}.json`);
        aDownload.style.display = "none";
        // divAppMenu.appendChild(aDownload);
        aDownload.click();
    }
    function uploadNotepad(event) {

        let fid = parseInt(divAppTitle.getAttribute("rid"));
        let resource = resources.find(r => r.id == fid);

        let divNotePadMenu = divAppMenuBar.querySelector("[purpose='notepad-menu']");

        let spanSave = divNotePadMenu.querySelector("[action='save']");
        let spanBold = divNotePadMenu.querySelector("[action='bold']");
        let spanItalic = divNotePadMenu.querySelector("[action='italic']");
        let spanUnderline = divNotePadMenu.querySelector("[action='underline']");
        let inputBGColor = divNotePadMenu.querySelector("[action='bg-color']");
        let inputTextColor = divNotePadMenu.querySelector("[action='fg-color']");
        let selectFontFamily = divNotePadMenu.querySelector("[action='font-family']");
        let selectFontSize = divNotePadMenu.querySelector("[action='font-size']");
        let textArea = divAppBody.querySelector("textArea");
        let spanDwonload = divNotePadMenu.querySelector("[action='download']");
        let inputUpload = divNotePadMenu.querySelector("[action='upload']");


        const reader = new FileReader();
        reader.onload = function (event) {
            let resource = JSON.parse(event.target.result);
            // console.log(uploadedFileJSO);

            // resource.isBold = uploadedFileJSO.isBold;
            // resource.isItalic = uploadedFileJSO.isItalic;
            // resource.isUnderline = uploadedFileJSO.isUnderline;
            // resource.bgColor = uploadedFileJSO.bgColor;
            // resource.textColor = uploadedFileJSO.textColor;
            // resource.fontFamily = uploadedFileJSO.fontFamily;
            // resource.fontSize = uploadedFileJSO.fontSize;
            // resource.textArea = uploadedFileJSO.textArea;


            spanBold.setAttribute("pressed", !resource.isBold);
            spanItalic.setAttribute("pressed", !resource.isItalic);
            spanUnderline.setAttribute("pressed", !resource.isUnderline);
            inputBGColor.value = resource.bgColor;
            inputTextColor.value = resource.textColor;
            selectFontFamily.value = resource.fontFamily;
            selectFontSize.value = resource.fontSize;
            textArea.value = resource.textArea;


            spanBold.dispatchEvent(new Event("click"));
            spanItalic.dispatchEvent(new Event("click"));
            spanUnderline.dispatchEvent(new Event("click"));
            inputBGColor.dispatchEvent(new Event("change"));
            inputTextColor.dispatchEvent(new Event("change"));
            selectFontFamily.dispatchEvent(new Event("change"));
            selectFontSize.dispatchEvent(new Event("change"));


            saveToStorage();




        };
        reader.readAsText(event.target.files[0]);

    }

    function closeApp() {
        let closeBtn = this;
        divApp.style.display = "none";
        fileOpened.id = -1;
        fileOpened.state = "closed";
    }
    function minimizeApp() {

        divAppMenuBar.setAttribute("display", "minimize");
        divAppBody.setAttribute("display", "minimize");
        divApp.setAttribute("display", "minimize");
    }
    function maximizeApp() {

        divAppMenuBar.setAttribute("display", "normal");
        divAppBody.setAttribute("display", "normal");
        divApp.setAttribute("display", "normal");
        
    }

    function saveNotePad() {
        let divNotePadMenu = this.parentNode;
        let spanSave = divNotePadMenu.querySelector("[action='save']");
        let spanBold = divNotePadMenu.querySelector("[action='bold']");
        let spanItalic = divNotePadMenu.querySelector("[action='italic']");
        let spanUnderline = divNotePadMenu.querySelector("[action='underline']");
        let inputBGColor = divNotePadMenu.querySelector("[action='bg-color']");
        let inputTextColor = divNotePadMenu.querySelector("[action='fg-color']");
        let selectFontFamily = divNotePadMenu.querySelector("[action='font-family']");
        let selectFontSize = divNotePadMenu.querySelector("[action='font-size']");
        let textArea = divAppBody.querySelector("textArea");

        let fid = parseInt(divAppTitle.getAttribute("rid"));
        let resource = resources.find(r => r.id == fid);

        resource.isBold = spanBold.getAttribute("pressed") == "true";
        resource.isItalic = spanItalic.getAttribute("pressed") == "true";
        resource.isUnderline = spanUnderline.getAttribute("pressed") == "true";
        resource.bgColor = inputBGColor.value;
        resource.textColor = inputTextColor.value;
        resource.fontFamily = selectFontFamily.value;
        resource.fontSize = selectFontSize.value;
        resource.textArea = textArea.value;

        saveToStorage();


    }
    function makeNotePadBold() {
        let textArea = divAppBody.querySelector("textArea");
        let isPressed = this.getAttribute("pressed") == "true";
        if (!isPressed) {
            this.setAttribute("pressed", true);
            textArea.style.fontWeight = "bold";
        }
        else {
            this.setAttribute("pressed", false);
            textArea.style.fontWeight = "normal";
        }
    }
    function makeNotePadItalic() {
        let textArea = divAppBody.querySelector("textArea");
        let isPressed = this.getAttribute("pressed") == "true";
        if (!isPressed) {
            this.setAttribute("pressed", true);
            textArea.style.fontStyle = "italic";
        }
        else {
            this.setAttribute("pressed", false);
            textArea.style.fontStyle = "normal";
        }
    }
    function makeNotePadUnderline() {
        let textArea = divAppBody.querySelector("textArea");
        let isPressed = this.getAttribute("pressed") == "true";
        if (!isPressed) {
            this.setAttribute("pressed", true);
            textArea.style.textDecoration = "underline";
        }
        else {
            this.setAttribute("pressed", false);
            textArea.style.textDecoration = "none";
        }
    }
    function changeNotePadBGColor() {
        let color = this.value;
        let textArea = divAppBody.querySelector("textArea");
        textArea.style.backgroundColor = color;
    }
    function changeNotePadTextColor() {
        let color = this.value;
        let textArea = divAppBody.querySelector("textArea");
        textArea.style.color = color;
    }
    function changeNotePadFontFamily() {
        let fontFamily = this.value;
        let textArea = divAppBody.querySelector("textArea");
        textArea.style.fontFamily = fontFamily;
    }
    function changeNotePadFontSize() {
        let fontSize = this.value;
        let textArea = divAppBody.querySelector("textArea");
        textArea.style.fontSize = `${fontSize}px`;
    }

    function saveToStorage() {
        let rjson = JSON.stringify(resources);
        localStorage.setItem("data", rjson);
    }

    function loadFromStorage() {
        let rjson = localStorage.getItem("data");
        if (!rjson) {
            alert("Oops! There are no folders to show!");
            return;
        }

        resources = JSON.parse(rjson);
        resources.forEach(r => {
            if (r.pid == cfid) {
                if (r.rtype == "folder") {
                    addFolderHTML(r.name, r.id, r.pid);
                }
                else if (r.rtype == "text-file") {
                    addTextFileHTML(r.name, r.id, r.pid);
                }
                else if (r.rtype == "album"){
                    addAlbumHTML(r.name, r.id, r.pid);
                }

            }

            if (r.id > rid) {
                rid = r.id;
            }
        });
        divApp.style.display = "none";

    }


    loadFromStorage();


})();