const CONFIG = {
	id_counter: 1,
    people: [],
    relations: [],
    people_dict: {},
    dir_uuid: null
};

function createNode(name, title, managerId = null) {
    const newNode = $("<li></li>");
    $(newNode).append(`<a id="person-${CONFIG.id_counter}">[${CONFIG.id_counter}]: ${name} (${title})</a>`);

    const person = {
		id: CONFIG.id_counter,
		name: name,
		title: title,
	};

    CONFIG.people.push(person);
    CONFIG.people_dict[CONFIG.id_counter] = person;

    if (managerId === null) {
        $('#directory').append(newNode);
    }
    else {
        CONFIG.relations.push([managerId, CONFIG.id_counter]);

        const manager = $('#person-' + managerId).parent();
        if ($(manager).find('ul').length == 0) {
            $(manager).append("<ul></ul>");
        }

        $(manager).find("ul:first").append(newNode);
    }

    CONFIG.id_counter += 1;
}

$(document).ready(() => {
    $("#btn-add").click(() => {
		const name = $("#input-name").val();
		const title = $("#input-title").val();
		const managerId = $("#input-manager").val();

        if (name.length > 0 && title.length > 0) {
            if (CONFIG.id_counter > 1) {
                if (managerId.length > 0) {
                    const mId = parseInt(managerId);
                    if (mId > 0 && mId < CONFIG.id_counter) {
                        createNode(name, title, mId);
						$("#input-name").val("");
						$("#input-title").val("");
						$("#input-manager").val("");
                    }
                    else {
                        alert("There is no manager with this ID!");
                    }
                }
                else {
                    alert('You need to fill manager id property!');
                }
            }
            else {
                createNode(name, title);
                $("#input-name").val("");
                $("#input-title").val("");
                $("#input-manager").prop("disabled", false);
            }
        }
        else {
            alert('You need to fill name and title properties!');
        }
	});

    $("#btn-build").click(async () => {
        if (CONFIG.id_counter > 2) {
            const res = await axios.post("/api/v1/directory", { people: CONFIG.people, relations: CONFIG.relations });
            const response = res.data;

            if (response && response.success) {
                const data = response.data;
                CONFIG.dir_uuid = data.uuid;
            }
        }
        else {
            alert('You need at least two people to build the directory!');
        }
    });

    $("#btn-find").click(async () => {
        const personal1 = $("#input-personal-1").val();
		const personal2 = $("#input-personal-2").val();

        $("#input-personal-1").val("");
        $("#input-personal-2").val("");

        const uuid = CONFIG.dir_uuid;

        try {
            const res = await axios.get(`/api/v1/directory/${uuid}`, { params: { personal1, personal2 } });
            const response = res.data;

            if (response && response.success) {
                const data = response.data;
                const p1= CONFIG.people_dict[personal1];
                const p2 = CONFIG.people_dict[personal2];
                const m = CONFIG.people_dict[data.common_manager_id];
                $("#result").html(`The closest common manager <br/> between [${p1.id}]: ${p1.name} (${p1.title}) and [${p2.id}]: ${p2.name} (${p2.title}) <br/> is [${m.id}]: ${m.name} (${m.title}).`);
            }
            else {
                alert(response.error);
            }
        }
        catch {
            alert('You need to build the directory first!');
        }
        
    });
});