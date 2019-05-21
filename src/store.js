import { action, observable } from "mobx"


class Model {

    static modelRoots = {
        "1+2": {
            $id: "1",
            $type: "BinaryExpression",
            operator: "+",
            left: {
                $id: "2",
                $type: "Literal",
                value: 1
            },
            right: {
                $id: "3",
                $type: "Literal",
                value: 2
            }
        },
        "1+2*3": {
            $id: "1",
            $type: "BinaryExpression",
            operator: "+",
            left: {
                $id: "2",
                $type: "Literal",
                value: 1
            },
            right: {
                $id: "3",
                $type: "BinaryExpression",
                operator: "*",
                left: {
                    $id: "4",
                    $type: "Literal",
                    value: 2
                },
                right: {
                    $id: "5",
                    $type: "Literal",
                    value: 3
                }
            }
        },
        "empty": null
    }

    @observable root = Model.modelRoots["1+2*3"]

    @action setRoot = newRoot => { this.root = newRoot }

}

const propertyNames = node => Object.getOwnPropertyNames(node).filter(propName => !(propName === "$id" || propName === "$type" || (node[propName] instanceof Function)))

const isNode = node => node.$id && node.$type


class EditState {

    /**
     * Determines whether all nodes should revert to a read-only reflective visualisation.
     */
    @observable allReflective = false
    @action setReflective = reflective => { this.allReflective = reflective }


    /**
     * Determines whether all binary expressions are wrapped in parentheses, to better reflect AST structure.
     */
    @observable wrapBinaryExpressions = false
    @action setWrapBinaryExpressions = value => { this.wrapBinaryExpressions = value }

    /**
     * Determines which box has focus.
     */
    @observable focusBox = null
    @observable focusId = null
    @action setFocusBox = box => {
        this.focusBox = box
        this.focusId = box ? box.id() : null
    }

}


class Store {
    model = new Model()
    editState = new EditState()
}
  
const store = new Store()
  

export { Model, propertyNames, isNode, EditState, store }

