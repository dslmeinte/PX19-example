import React from "react"
import { reflectiveRenderNode } from "./reflective"



/* abstract */ class Box {

    node = null
    role = null
    parentBox = null

    constructor(node, role, parentBox) {
        this.node = node
        this.role = role
        this.parentBox = parentBox
    }

    id = () => (this.node ? this.node.$id : "null") + (this.role ? ("-" + this.role) : "")

    isFocused = editState => editState.focusId === this.id()

    focusElement = editState => (element => { if (this.isFocused(editState) && element) { element.focus() } })

    render(editState) {
        throw Error(`#render(..) not implemented`)
    }

    toJson() {
        throw Error(`#toJson(..) not implemented`)
    }

    firstFocusableBox = () => this
    lastFocusableBox = () => this

    handleKey = editState => (event => {
        if (event.key === "ArrowRight") {
            this.goRight(editState)
        } else if (event.key === "ArrowLeft") {
            this.goLeft(editState)
        } else if (this.subHandleKey) {
            this.subHandleKey(event.key)
        }
    })

    goRight = editState => {
        let container = this.parentBox
        let box = this
        while (container && container instanceof HorizontalBox) {
            const idx = container.children.indexOf(box)
            if (idx + 1 < container.children.length) {
                box = container.children[idx + 1]
                editState.setFocusBox(box.firstFocusableBox())
                return
            } else {
                box = container
                container = container.parentBox
            }
        }
    }

    goLeft = editState => {
        let container = this.parentBox
        let box = this
        while (container && container instanceof HorizontalBox) {
            const idx = container.children.indexOf(box)
            if (idx - 1 >= 0) {
                box = container.children[idx - 1]
                editState.setFocusBox(box.lastFocusableBox())
                return
            } else {
                box = container
                container = container.parentBox
            }
        }
    }

}


class PlaceholderBox extends Box {

    placeholderText = null
    subHandleKey = null

    constructor(node, role, parentBox, placeholderText, handleKey) {
        super(node, role, parentBox)
        this.placeholderText = placeholderText
        this.subHandleKey = (handleKey || (box => (key => { console.log(`undelegated: subHandleKey('${key}')`) })))(this)
    }

    render = editState => <div
            className={"placeholder" + (this.isFocused(editState) ? " focus" : "")}
            key={this.id()}
            tabIndex={0}
            onKeyUp={this.handleKey(editState)}
            onClick={_ => editState.setFocusBox(this)}
            onBlur={_ => editState.setFocusBox(null)}
            ref={this.focusElement(editState)}
        ><span>{this.isFocused(editState) ? "|" : (this.placeholderText || "")}</span>
    </div>

    toJson = () => `Placeholder(${this.id()})`

}


class HorizontalBox extends Box {

    children = []

    constructor(node, role, parentBox) {
        super(node, role, parentBox)
    }

    withChildren(children) {
        this.children = children
    }

    firstFocusableBox = () => this.children[0].firstFocusableBox()
    lastFocusableBox = () => this.children[this.children.length - 1].lastFocusableBox()

    render = editState => <div
        className="horizontal"
        key={this.id()}
        >{this.children.map(child => child.render(editState))}
    </div>

    toJson = () => ({ "_class": "Horizontal", "id": this.id(), children: this.children.map(child => child.toJson()) })

}


class TextBox extends Box {

    value = null

    constructor(node, role, parentBox, value) {
        super(node, role, parentBox)
        this.value = value
    }

    render = editState => <div
        className="text"
        key={this.id()}
        tabIndex={0}
        onKeyUp={this.handleKey(editState)}
        onClick={_ => editState.setFocusBox(this)}
        onFocus={_ => editState.setFocusBox(this)}
        onBlur={_ => editState.setFocusBox(null)}
        ref={this.focusElement(editState)}
        >{this.value}
    </div>

    toJson = () => `Text(${this.id()}, '${this.value}')`

}


class TextInputBox extends Box {

    value = null
    update = null

    constructor(node, role, parentBox, value, update) {
        super(node, role, parentBox)
        this.value = value
        this.update = update
    }

    render = editState => <input
        className="textInput"
        key={this.id()}
        tabIndex={0}
        type="text"
        value={this.value}
        onChange={event => {
            if (event.target.value !== this.value && this.update) {
                this.update(event.target.value)
            }
        }}
        onFocus={_ => editState.setFocusBox(this)}
        onBlur={_ => editState.setFocusBox(null)}
        onKeyUp={this.handleKey(editState)}
        ref={this.focusElement(editState)}
    />

    toJson = () => `TextInput(${this.id()}, '${this.value}')`

}


class ReflectiveBox extends Box {

    constructor(node, role, parentBox) {
        super(node, role, parentBox)
    }

    render = editState => reflectiveRenderNode(this.node, editState)

    firstFocusableBox = () => null

    toJson = () => ({ "_class": "ReflectiveBox", "node": this.node })

}


export { HorizontalBox, PlaceholderBox, ReflectiveBox, TextBox, TextInputBox }

