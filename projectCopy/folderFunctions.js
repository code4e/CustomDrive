var handleFolders = function () {
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
                else if (r.rtype == "album") {
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
                else if (r.rtype == "album") {
                    addAlbumHTML(r.name, r.id, r.pid);
                }

            }
        });
    }
}

export default {handleFolders}


