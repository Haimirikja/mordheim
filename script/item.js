
class Item {
    #id = "";
    #name = "";
    description = [];
    cost = 0;

    constructor(name = "", description = [], cost = 0) {
        cost = parseInt(cost);
        this.#name = typeof name === 'string' ? name : "";
        this.description = Array.isArray(description) ? description.filter(row => typeof row === 'string') : [];
        this.cost = isInteger(cost, true) ? cost : 0;
        this.#id = generateId(this.name);
    }

    get id() { return this.#id; }
    get name() { return this.#name; }

    static parse = (object) => {
        try {
            if (!(object instanceof Object)) throw false;
            return new Item (
                object.name,
                object.description?.filter(x => typeof x === 'string'),
                object.cost,
            );
        } catch(e) {
            console.error(e);
            return undefined;
        }
    }
}
