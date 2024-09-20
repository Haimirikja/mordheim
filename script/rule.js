
class Rule {
    #id = "";
    name = "";
    description = [];

    constructor(name = "", description = []) {
        this.name = typeof name === 'string' ? name : "";
        this.description = Array.isArray(description) ? description.filter(row => typeof row === 'string') : [];
        this.#id = generateId(this.name);
    }
    
    get id() { return this.#id; }

    static parse = (object) => {
        try {
            if (!(object instanceof Object)) throw false;
            return new Rule (
                object.name,
                object.description?.filter(x => typeof x === 'string'),
            );
        } catch(e) {
            console.error(e);
            return undefined;
        }
    }

    toHTML = () => {
        const ruleElement = document.createElement("div");
        this.description.forEach((row, i) => {
            const rowElement = document.createElement("div");
            if (i === 0) {
                const name = document.createElement("b");
                name.innerText = `${this.name}: `;
                rowElement.appendChild(name);
            }
            rowElement.appendChild(document.createTextNode(row));
            ruleElement.appendChild(rowElement);
        });
        return ruleElement;
    }
}
