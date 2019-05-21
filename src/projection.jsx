import { action } from "mobx"
import { HorizontalBox, PlaceholderBox, ReflectiveBox, TextBox, TextInputBox } from "./boxes"


const generalHandleKeyForPlaceholder = box => (key => {
    console.log(`${box.id()}: key=${key}`)
    if (key === "*") {
        const parentNode = box.parentBox

    }
})


/*
 * Projecting nodes -> boxes
 */


const projectBinaryExpressionCore = (node, horizontalBox, editState) => [
    node.left ? projectNode(node.left, horizontalBox, editState) : new PlaceholderBox(node, "left", horizontalBox, "<left>", generalHandleKeyForPlaceholder),
    editState.focusId === node.$id + "-op"
        ? new TextInputBox(node, "op", horizontalBox, node.operator)
        : new TextBox(node, "op", horizontalBox, node.operator),
    node.right ? projectNode(node.right, horizontalBox, editState) : new PlaceholderBox(node, "right", horizontalBox, "<right>", generalHandleKeyForPlaceholder),
]

const projectBinaryExpression = (node, parentBox, editState) => {
    const horizontalBox = new HorizontalBox(node, null, parentBox)
    if (editState.wrapBinaryExpressions) {
        horizontalBox.withChildren([
            new TextBox(node, "(", horizontalBox, "("),
            ...projectBinaryExpressionCore(node, horizontalBox, editState),
            new TextBox(node, ")", horizontalBox, ")")
        ])
    } else {
        horizontalBox.withChildren(projectBinaryExpressionCore(node, horizontalBox, editState))
    }
    return horizontalBox
}


const projectLiteral = (node, parentBox, editState) => {
    const horizontalBox = new HorizontalBox(node, null, parentBox)
    horizontalBox.withChildren([
        new PlaceholderBox(node, "lph", horizontalBox, null, generalHandleKeyForPlaceholder),
        editState.focusId === node.$id
            ? new TextInputBox(node, null, horizontalBox, node.value, action(newValue => { node.value = newValue }))
            : new TextBox(node, null, horizontalBox, node.value),
        new PlaceholderBox(node, "rph", horizontalBox, null, generalHandleKeyForPlaceholder)
    ])
    return horizontalBox
}


/**
 * Projects node polymorphically, falling back to a read-only reflective
 * rendering for (meta-)types that aren't handled (yet).
 */
function projectNode(node, parentBox, editState) {
    if (editState.allReflective) {
        return node === null ? new TextBox(null, null, parentBox, "<empty>") : new ReflectiveBox(node, null, parentBox)
    }
    if (node === null) {
        return new PlaceholderBox(null, null, parentBox, "<empty>", generalHandleKeyForPlaceholder)
    }
    switch (node.$type) {
        case "BinaryExpression": return projectBinaryExpression(node, parentBox, editState)
        case "Literal": return projectLiteral(node, parentBox, editState)

        // fall back to reflective visualisation, but only for current node, not its descendants:
        default: return new ReflectiveBox(node, null, parentBox)
    }
}


export { projectNode }

