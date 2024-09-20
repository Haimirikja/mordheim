
class Skill {
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
            return new Item (
                object.name,
                object.description?.filter(x => typeof x === 'string'),
            );
        } catch(e) {
            console.error(e);
            return undefined;
        }
    }
}
