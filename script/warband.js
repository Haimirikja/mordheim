
class Warband {
    #faction = "";
    #race = "";
    goldCrowns = 500;
    name = "";
    #warriors = [];
    #shops = [];
    #roster = null;
    #stash = [];

    constructor(faction = "", race = "", goldCrowns = 0, { name = "", warriors = [], shops = [], roster = null, stash = [] } = {}) {
        goldCrowns = parseInt(goldCrowns);
        this.#faction = typeof faction === 'string' ? faction : "";
        this.#race = typeof race === 'string' ? race : "";
        this.goldCrowns = 500 + (isInteger(goldCrowns, true) ? goldCrowns : 0);
        this.name = typeof name === 'string' ? name : "";
        this.#warriors = Array.isArray(warriors) ? warriors.filter(warrior => warrior instanceof Warrior) : [];
// DEFINE SHOP CLASS
        //this.#shops = Array.isArray(shops) ? shops.filter(shop => shop instanceof Shop) : [];
        this.#shops = Array.isArray(shops) ? shops : [];
        this.#roster = roster instanceof Roster ? roster : Roster.Empty;
        this.#stash = Array.isArray(stash) ? stash.filter(item => item instanceof Item) : [];
    }

    static parse = (object) => {
        try {
            if (!(object instanceof Object)) throw "Bad format.";
            return new Warband(
                object.faction,
                object.race,
                object.goldCrowns,
                {
                    name: object.name,
                    warriors: object.warriors?.map(x => Warrior.parse(x)),
                    roster: object.roster ? Roster.parse(object.roster) : Roster.Empty,
                    stash: object.stash?.map(x => Item.parse(x)),
                },
            );
        } catch(e) {
            console.error(e);
            return undefined;
        }
    }

    get faction() { return this.#faction; }
    get race() { return this.#race; }
    get warriors() { return this.#warriors; }
    get shops() { return this.#shops; }
    get roster() { return this.#roster; }
    get stash() { return this.#stash; }

    removeWarrior = (groupId = "", warriorId = "") => {
        this.roster.groups.find(currentGroup => currentGroup.id === groupId).removeWarrior(warriorId);
        return this.roster;
    }
    removeItem = (id = "") => {
        this.#stash = this.#stash.filter(item => item.id !== id);
        return this.stash;
    }

    addWarrior = (warrior) => {
        try {
            if (!(warrior instanceof Warrior)) return false;
            if (warrior.maxQuantity > 0 && this.roster.filter(current => current.type === warrior.type).length >= warrior.maxQuantity) throw `Max number of ${warrior.type} reached`;
            if (warrior.cost > this.goldCrowns) throw "Not enough gold crowns";
            this.goldCrowns -= warrior.cost;
            this.#roster.push(warrior);
            return true;
        } catch(e) {
            console.error(e);
            return false;
        }
    }
    addItem = (item) => {
        try {
            if (!(item instanceof Item)) return false;
            if (warrior.cost > this.goldCrowns) throw "Not enough gold crowns";
            this.#stash.push(item);
            return true;
        } catch(e) {
            console.error(e);
            return false;
        }
    }

    toHTML = () => {
        const warbandElement = document.createElement("div");
        warbandElement.classList.add("mordheim-warband");
        const title = document.createElement("div");
        title.classList.add("mordheim-title");
        title.classList.add("mordheim-faction");
        title.appendChild(document.createTextNode(this.faction));
        warbandElement.appendChild(title);
        const content = document.createElement("div");
        content.classList.add("mordheim-warband-content");
        const rosterElement = document.createElement("div");
        rosterElement.classList.add("mordheim-warband-roster");
        const roster = this.rosterToHTML();
        rosterElement.appendChild(roster);
        content.appendChild(rosterElement);
        const warriorList = document.createElement("aside");
        warriorList.classList.add("mordheim-warband-warriors");
        const heroesList = document.createElement("div");
        heroesList.classList.add("mordheim-warband-warriorlist");
        const heroesTitle = document.createElement("div");
        heroesTitle.classList.add("mordheim-title");
        heroesTitle.appendChild(document.createTextNode("- Heroes -"));
        heroesList.appendChild(heroesTitle);
        const henchmenList = document.createElement("div");
        henchmenList.classList.add("mordheim-warband-warriorlist");
        const henchmenTitle = document.createElement("div");
        henchmenTitle.classList.add("mordheim-title");
        henchmenTitle.appendChild(document.createTextNode("- Henchmen -"));
        henchmenList.appendChild(henchmenTitle);
        this.warriors.forEach(warrior => {
            const warriorElement = warrior.toHTML();
            if (warrior.hero) heroesList.appendChild(warriorElement);
            else henchmenList.appendChild(warriorElement);
        });
        warriorList.appendChild(heroesList);
        warriorList.appendChild(henchmenList);
        content.appendChild(warriorList);
        warbandElement.appendChild(content);
        return warbandElement;
    }

    rosterToHTML = () => {
        const roster = document.createElement("div");
        const goldCrowns = document.createElement("input");
        goldCrowns.type = "text";
        goldCrowns.value = this.goldCrowns;
        roster.appendChild(goldCrowns);
        //warriors
        const groupList = document.createElement("div");
        groupList.appendChild(this.roster.toHTML());
        // event to add warrior to group
        groupList.querySelectorAll(".SelectWarrior").forEach(select => {
            const group = select.closest(".mordheim-warband-group");
            const groupId = group.id;
            const selectableWarriors = this.warriors.filter(x => groupId.indexOf("hero") >= 0 ? x.hero : !x.hero && (x.maxQuantity === 0 || x.maxQuantity > this.roster.groups.filter(g => g.warrior?.id === x.id).length));
            selectableWarriors.forEach(warrior => {
                const warriorOption = document.createElement("option");
                warriorOption.setAttribute("value", warrior.id);
                warriorOption.appendChild(document.createTextNode(warrior.type));
                select.appendChild(warriorOption);
            });
        });
        groupList.querySelectorAll(".AddWarrior").forEach(button => {
            button.addEventListener('click', (e) => {
                const group = e.currentTarget.closest(".mordheim-warband-group");
                const groupId = group.id;
                const selectedWarrior = group.querySelector(".SelectWarrior")?.value;
                if (!this.roster.groups.find(x => x.id === groupId).addWarrior(this.warriors.find(x => x.id === selectedWarrior))) return;
                roster.innerHTML = null;
                roster.appendChild(this.rosterToHTML());
            });
        });
        // event to add group to roster
        groupList.querySelectorAll(".AddGroup").forEach(button => {
            button.addEventListener('click', (e) => {
                const group = e.currentTarget.closest(".mordheim-warband-group");
                if (!this.roster.addGroup(group.data.hero)) return;
                roster.innerHTML = null;
                roster.appendChild(this.rosterToHTML());
            });
        });
        roster.appendChild(groupList);
        return roster;
    }
}
