import * as path from "path";
import { QueryUnit } from "../../service/queryUnit";
import { InfoNode } from "../other/infoNode";
import { Node } from "../interface/node";
import { DatabaseCache } from "../../service/common/databaseCache";
import { ConnectionManager } from "../../service/connectionManager";
import { TableNode } from "./tableNode";
import { Constants, ModelType, Template } from "../../common/constants";
import { ViewNode } from "./viewNode";
import { FileManager, FileModel } from "@/common/filesManager";

export class SystemViewGroup extends Node {

    public iconPath: string = path.join(Constants.RES_PATH, "icon/view.png");
    public contextValue = ModelType.SYSTEM_VIEW_GROUP
    constructor(readonly parent: Node) {
        super("SYSTEM_VIEW")
        this.uid = `${parent.getConnectId()}_${parent.database}_${ModelType.SYSTEM_VIEW_GROUP}`;
        this.init(parent)
    }

    public async getChildren(isRresh: boolean = false): Promise<Node[]> {

        let tableNodes = DatabaseCache.getChildListOfId(this.uid);
        if (tableNodes && !isRresh) {
            return tableNodes;
        }
        return QueryUnit.queryPromise<any[]>(await ConnectionManager.getConnection(this),
            this.dialect.showSystemViews(this.database))
            .then((tables) => {
                tableNodes = tables.map<TableNode>((table) => {
                    return new ViewNode(table.name, '', this);
                });
                if (tableNodes.length == 0) {
                    tableNodes=[new InfoNode("This database has no system view")];
                }
                DatabaseCache.setTableListOfDatabase(this.uid, tableNodes);
                return tableNodes;
            })
            .catch((err) => {
                return [new InfoNode(err)];
            });
    }

}