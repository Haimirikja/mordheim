
class Statistics {
    static #format = [
        { name: "movement", code: "M", value: 0 },
        { name: "weapon skill", code: "WS", value: 0 },
        { name: "ballistic skill", code: "BS", value: 0 },
        { name: "strength", code: "S", value: 0 },
        { name: "toughness", code: "T", value: 0 },
        { name: "wounds", code: "W", value: 0 },
        { name: "initiative", code: "I", value: 0 },
        { name: "attacks", code: "A", value: 0 },
        { name: "leadership", code: "Ld", value: 0 },
    ];
    #stats = [];

    constructor(stats = []) {
        stats = Array.isArray(stats) && stats.length === Statistics.format.length ? stats.map(stat => parseInt(stat)) : new Array(9);
        Statistics.#format.forEach((stat, i) => {
            try {
                const currentFormat = JSON.parse(JSON.stringify(stat));
                const currentStat = stats[i];
                currentFormat.value = isInteger(currentStat, true) ? currentStat : 0;
                this.#stats.push(currentFormat);
            } catch(e) { return; }
        });
    }

    static get format() { return Statistics.#format; }
    get stats() { return this.#stats; }
    static get Empty() { return new Statistics(); }

    static parse(array) {
        try {
            if (!Array.isArray(array)) throw "Bad format";
            if (array.length !== Statistics.format.length) throw "Not enough parameters";
            return new Statistics(array);
        } catch(e) {
            console.error(e);
            return undefined;
        }
    }
    
    toHTML = () => {
        const statistics = document.createElement("table");
        statistics.classList.add("mordheim-table");
        const header = document.createElement("tr");
        header.classList.add("mordheim-table-header");
        const body = document.createElement("tr");
        body.classList.add("mordheim-table-body");
        for (const stat of this.stats) {
            const th = document.createElement("th");
            th.appendChild(document.createTextNode(stat.code));
            header.appendChild(th);
            const td = document.createElement("td");
            td.appendChild(document.createTextNode(stat.value));
            body.appendChild(td);
        }
        statistics.appendChild(header);
        statistics.appendChild(body);
        return statistics;
    }
}

class Warrior {
    #id = "";
    #type = "";
    name = "";
    statistics = null;
    #hero = false;
    #large = false;
    #minQuantity = 0;
    #maxQuantity = 0;
    #cost = 0;
    experience = 0;
    #specialRules = [];
    #skills = [];
    #inventory = [];

    constructor(type = "", { name = "", statistics = Statistics.Empty, hero = false, large = false, minQuantity = 0, maxQuantity = 0, cost = 0, experience = 0, specialRules = [], skills = [], inventory = [] } = {}) {
        minQuantity = parseInt(minQuantity);
        maxQuantity = parseInt(maxQuantity);
        cost = parseInt(cost);
        experience = parseInt(experience);
        this.#type = typeof type === 'string' ? type : "";
        this.name = typeof name === 'string' ? name : "";
        this.statistics = statistics instanceof Statistics ? statistics : Statistics.Empty;
        this.#hero = typeof hero === 'boolean' ? hero : false;
        this.#large = typeof large === 'boolean' ? large : false;
        this.#minQuantity = isInteger(minQuantity, true) ? minQuantity : 0;
        this.#maxQuantity = isInteger(maxQuantity, true) ? maxQuantity : 0;
        this.#cost = isInteger(cost, true) ? cost : 0;
        this.experience = isInteger(experience, true) ? experience : 0;
        this.#specialRules = Array.isArray(specialRules) ? specialRules.filter(rule => rule instanceof Rule) : [];
        this.#skills = Array.isArray(skills) ? skills.filter(skill => skill instanceof Skill) : [];
        this.#inventory = Array.isArray(inventory) ? inventory.filter(item => item instanceof Item) : [];
        this.#id = generateId(this.#type);
    }

    static parse = (object) => {
        try {
            if (!(object instanceof Object)) throw "Bad format.";
            return new Warrior(
                object.type,
                {
                    name: object.name,
                    statistics: Statistics.parse(object.statistics),
                    hero: object.hero,
                    large: object.large,
                    minQuantity: object.minQuantity,
                    maxQuantity: object.maxQuantity,
                    cost: object.cost,
                    experience: object.experience,
                    specialRules: object.specialRules?.map(x => Rule.parse(x)),
                    skills: object.skills?.map(x => Skill.parse(x)),
                    inventory: object.inventory?.map(x => Item.parse(x)),
                },
            );
        } catch(e) {
            console.error(e);
            return undefined;
        }
    }

    get id() { return this.#id; }
    get type() { return this.#type; }
    get hero() { return this.#hero; }
    get large() { return this.#large; }
    get minQuantity() { return this.#minQuantity; }
    get maxQuantity() { return this.#maxQuantity; }
    get cost() { return this.#cost; }
    get specialRules() { return this.#specialRules; }
    get skills() { return this.#skills; }
    get inventory() { return this.#inventory; }

    removeSpecialRule = (id = "") => {
        this.#specialRules = this.#specialRules.filter(rule => rule.id !== id);
        return this.#specialRules;
    }
    removeSkill = (id = "") => {
        this.#skills = this.#skills.filter(skill => skill.id !== id);
        return this.#skills;
    }
    removeItem = (id = "") => {
        this.#inventory = this.#inventory.filter(item => item.id !== id);
        return this.#inventory;
    }

    addSpecialRule = (rule) => {
        if (!(rule instanceof Rule)) return false;
        this.#specialRules.push(rule);
        return true;
    }
    addSkill = (skill) => {
        if (!(skill instanceof Skill)) return false;
        this.#skills.push(skill);
        return true;
    }
    addItem = (item) => {
        if (!(item instanceof Item)) return false;
        this.#specialRules.push(item);
        return true;
    }

    toHTML = () => {
        const warriorElement = document.createElement("div");
        warriorElement.setAttribute("data-id", this.id);
        warriorElement.classList.add("mordheim-warrior");
        const type = document.createElement("div");
        type.classList.add("mordheim-title");
        // const addWarrior = document.createElement("div");
        // addWarrior.classList.add("mordheim-button");
        // addWarrior.classList.add("AddWarrior");
        // addWarrior.appendChild(document.createTextNode("+"));
        // type.appendChild(addWarrior);
        if (this.maxQuantity > 0) {
            const qty = document.createElement("div");
            qty.appendChild(document.createTextNode(this.minQuantity === this.maxQuantity ? this.minQuantity : `${this.minQuantity} - ${this.maxQuantity}`));
            type.appendChild(qty);
        }
        const typeName = document.createElement("div");
        typeName.appendChild(document.createTextNode(this.type));
        type.appendChild(typeName);
        warriorElement.appendChild(type);
        const cost = document.createElement("b");
        cost.innerText = `${this.cost} gold crowns`;
        warriorElement.appendChild(cost);
        warriorElement.appendChild(this.statistics.toHTML());
        if (this.specialRules.length) {
            const specialRules = document.createElement("div");
            specialRules.classList.add("mordheim-rules");
            this.specialRules.forEach(rule => {
                const ruleElement = rule.toHTML();
                specialRules.appendChild(ruleElement);
            });
            warriorElement.appendChild(specialRules);
        }
        return warriorElement;
    }

}
