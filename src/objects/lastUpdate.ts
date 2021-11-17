import fs from 'fs';
import dayjs, { Dayjs } from 'dayjs';

class LastUpdate {

    private readonly lastUpdateFile = "lastUpdate.json";
    private lastUpdate: number = -1;

    constructor() {
        fs.readFile(this.lastUpdateFile, (err, data) => {
            if (err) {
                throw err;
            }
            const arg = data;
            this.processData(arg);
        });
    }

    private processData(data: any) {
        if (data && data.lastUpdated) {
            this.lastUpdate = data.lastUpdate;
        }
    }

    public update() {
        this.lastUpdate = dayjs().valueOf();
        const json: any = {
            lastUpdated: this.lastUpdate,
        };
        fs.writeFile(this.lastUpdateFile, json, 'utf8', (err: any) => {
            if (err) {
                throw err;
            }
        });
    }

    public get(): Dayjs | undefined {
        return this.lastUpdate > 0 
            ? dayjs(this.lastUpdate)
            : undefined;
    }

}

export default new LastUpdate();
