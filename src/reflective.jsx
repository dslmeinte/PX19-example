import React from "react"
import { propertyNames, isNode } from "./store"
import { projectNode } from "./projection"

// (next 3 need to be functions, not const's because of forward reference:)

function reflectiveRenderValue(value, editState) {
    return isNode(value) ? projectNode(value, null, editState).render(editState) : value
}

function reflectiveRenderProperty(propName, value, editState) {
    return <div key={propName}><span>{propName}: </span>{reflectiveRenderValue(value, editState)}</div>
}

function reflectiveRenderNode(node, editState) {
    return <div className="reflective">
        <div><span className="metaType">{node.$type}</span></div>
        <div className="properties">
            {propertyNames(node).map(propName => reflectiveRenderProperty(propName, node[propName], editState))}
        </div>
    </div>
}


export { reflectiveRenderNode }

