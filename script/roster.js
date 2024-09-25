
class RosterGroup {
    #id = "";
    #hero = false;
    #warrior = null;
    #warriorCount = 0;

    constructor(id = "", hero = false, { warrior = null, warriorCount = 0} = {}) {
        warriorCount = parseInt(warriorCount);
        this.#id = typeof id === 'string' ? id : "";
        this.#hero = typeof hero === 'boolean' ? hero : "";
        this.#warrior = warrior instanceof Warrior ? warrior : null;
        this.#warriorCount = isInteger(warriorCount, true) ? warriorCount : 0;
    }

    get id() { return this.#id; }
    get hero() { return this.#hero; }
    get warrior() { return this.#warrior; }
    get warriorCount() { return this.#warriorCount; }

    static parse = (object) => {
        try {
            if (!(object instanceof Object)) throw "Bad format";
            return new RosterGroup (
                object.id,
                {
                    warrior: Warrior.parse(object.warrior),
                    warriorCount: parseInt(object.count),
                }
            )
        } catch(e) {
            console.error(e);
            return undefined;
        }
    }

    static get Empty() { return new RosterGroup(); }

    isEmpty = () => !this.warrior;

    removeWarrior = (id = "") => {
        if (!this.warrior.id || this.warrior.id !== id) return false;
        this.#warriorCount -= 1;
        if (this.warriorCount <= 0) {
            this.#warriorCount = 0;
            this.#warrior = null;
        }
        return true;
    }
    addWarrior = (warrior) => {
        try {
            if (warrior && !(warrior instanceof Warrior)) return false;
            if (!this.hero && this.warriorCount === 5) throw "Henchmen limit reached.";
            if (this.hero && this.#warriorCount > 0) throw "Cannot add multiple instance of a hero.";
            if (!this.warrior) this.#warrior = warrior;
            this.#warriorCount += 1;
            return true;
        } catch(e) {
            console.error(e);
            return false;
        }
    }
    
    advancement = (index = 0) => {
        if (this.hero) {
            if (index <= 8 && index % 2 === 0) return true;
            if (index > 8 && index <= 20 && (index - 8) % 3 === 0) return true;
            if (index > 20 && index <= 36 && (index - 20) % 4 === 0) return true;
            if (index > 36 && index <= 51 && (index - 36) % 5 === 0) return true;
            if (index > 51 && index <= 69 && (index - 51) % 6 === 0) return true;
            if (index > 69 && index <= 90 && (index - 69) % 7 === 0) return true;
            return false;
        } else {
            switch (index) {
                case 2:
                case 5:
                case 9:
                case 14:
                    return true;
                default:
                    return false;
            }
        }
    }
    
    toHTML = () => {
        const groupElement = document.createElement("div");
        groupElement.id = this.id;
        groupElement.classList.add("mordheim-warband-group");
        const header = document.createElement("div");
        header.classList.add("mordheim-warband-group-header");
        const type = document.createElement("div");
        type.classList.add("mordheim-title");
        // type.appendChild(document.createTextNode(this.warrior ? this.warrior.type : this.hero ? "<Hero>" : "<Henchmen>"));
        type.appendChild(document.createTextNode(this.warrior ? this.warrior.type : `<${this.id}>`));
        header.appendChild(type);
        if (this.warrior) {
            const name = document.createElement("div");
            if (this.warrior.name) name.appendChild(document.createTextNode(this.warrior.name));
            else {
                const inputName = document.createElement("input");
                inputName.type = "text";
                name.appendChild(inputName);
            }
            header.appendChild(name);
        }
        const body = document.createElement("div");
        body.classList.add("mordheim-warband-group-body");
        const info = document.createElement("div");
        info.classList.add("mordheim-warband-group-info");
        const warriorList = document.createElement("div");
        warriorList.classList.add("mordheim-warband-group-warriorlist");
        if (!this.warrior || !this.hero) {
            if (this.warrior) {
                for (let i = 1; i <= this.warriorCount; i++) {
                    const warr = document.createElement("div");
                    warr.appendChild(document.createTextNode(i));
                    warriorList.append(warr);
                }
            }
            if (this.warriorCount < (this.warrior?.maxQuantity > 0 ? this.warrior.maxQuantity : 5)) {
                if (!this.warrior) {
                    const selectWarrior = document.createElement("select");
                    selectWarrior.classList.add("mordheim-select");
                    selectWarrior.classList.add("SelectWarrior");
                    header.appendChild(selectWarrior);
                }
                const add = document.createElement("div");
                add.classList.add("mordheim-button");
                add.classList.add("AddWarrior");
                add.appendChild(document.createTextNode("+"));
                header.appendChild(add);
                // const add = document.createElement("div");
                // add.classList.add("mordheim-button");
                // add.classList.add("AddWarrior");
                // add.appendChild(document.createTextNode("+"));
                // warriorList.append(add);
            }
        }
        info.appendChild(warriorList);
        const statistics = document.createElement("div");
        const experience = document.createElement("div");
        experience.classList.add("mordheim-experience");
        for (let i = 1; i <= (this.hero ? 90 : 14); i++) {
            const expElement = document.createElement("div");
            const exp = document.createElement("input");
            exp.type = "checkbox";
            exp.value = i;
            if (this.advancement(i)) exp.classList.add("mordheim-advancement");
            if (this.warrior) {
                if (i <= this.warrior.experience) exp.checked = true;
                exp.addEventListener('change', (e) => {
                    const selected = e.currentTarget;
                    const selectedValue = parseInt(selected.value);
                    const expList = Array.from(selected.closest(".mordheim-experience").querySelectorAll("input[type=checkbox]"));
                    if (selected.checked) expList.filter(x => parseInt(x.value) < selectedValue).forEach(input => input.checked = true);
                    else expList.filter(x => parseInt(x.value) > selectedValue).forEach(input => input.checked = false);
                });
            }
            else exp.disabled = true;
            expElement.appendChild(exp);
            experience.appendChild(expElement);
        }
        info.appendChild(statistics);
        info.appendChild(experience);
        const inventory = document.createElement("div");
        body.appendChild(info);
        body.appendChild(inventory);
        groupElement.appendChild(header);
        groupElement.appendChild(body);
        return groupElement;
    }

}

class Roster {
    #groups = [];

    constructor({ groups = [] } = {}) {
        this.#groups = Array.isArray(groups) ? groups.filter(x => x instanceof RosterGroup) : [];
    }

    get groups() { return this.#groups; }

    static get Empty() { return new Roster({ groups: [new RosterGroup("hero_1", true)] }); }

    static parse = (object) => {
        try {
            if (!(object instanceof Object)) throw "Bad format.";
            const roster = new Roster (
                {
                    groups: object.groups?.map(x => RosterGroup.parse(x))
                }
            );
            console.log(roster);
            return roster;
        } catch (e) {
            console.error(e);
            return undefined;
        }
    }

    removeGroup = (id = "") => {
        if (typeof id !== 'string') return false;
        this.#groups = this.groups.filter(group => group.id !== id);
        return true;
    }
    addGroup = (hero = false) => {
        hero = typeof hero === 'boolean' ? hero : false;
        let currentIndex = 0;
        this.groups.filter(group => group.hero === hero).forEach((group, i) => {
            const id = parseInt(/\d+$/igm.exec(group.id));
            if (id > i + 1) return;
            currentIndex = i + 1;
        });
        this.#groups.push(new RosterGroup(`${hero ? "hero" : "henchmen"}_${currentIndex + 1}`, hero));
        return true;
    }

    toHTML = () => {
        const roster = document.createElement("div");
        const heroes = document.createElement("div");
        const henchmen = document.createElement("div");
        this.groups.filter(group => group.hero === true).forEach(group => heroes.appendChild(group.toHTML()));
        const emptyHeroElement = document.createElement("div");
        emptyHeroElement.classList.add("mordheim-warband-group");
        emptyHeroElement.classList.add("AddGroup");
        emptyHeroElement.data = { hero: true };
        emptyHeroElement.appendChild(document.createTextNode(`Add a hero group`));
        heroes.appendChild(emptyHeroElement);
        this.groups.filter(group => group.hero === false).forEach(group => henchmen.appendChild(group.toHTML()));
        const emptyHenchmenElement = document.createElement("div");
        emptyHenchmenElement.classList.add("mordheim-warband-group");
        emptyHenchmenElement.classList.add("AddGroup");
        emptyHenchmenElement.data = { hero: false };
        emptyHenchmenElement.appendChild(document.createTextNode(`Add a henchmen group`));
        henchmen.appendChild(emptyHenchmenElement);
        roster.appendChild(heroes);
        roster.appendChild(henchmen);
        return roster;
    }
}
