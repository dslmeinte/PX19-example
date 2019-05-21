import React from "react"
import { observer } from "mobx-react"
import { projectNode } from "./projection"


const DebugInfo = observer(({ editState, projection }) => <div>
    <div>
        <label>Reflective?
            <input type="checkbox" onChange={event => { editState.setReflective(event.target.checked) }} />
        </label>
    </div>
    <div>
        <label>Show parentheses around all binary expressions?
        <input type="checkbox" onChange={event => { editState.setWrapBinaryExpressions(event.target.checked) }} />
        </label>
    </div>
    <div>
        <label>Focus id: </label><span>{editState.focusId ? <tt>{editState.focusId}</tt> : <i>(no focus)</i>}</span>
    </div>
</div>)


const Editor = observer(({ store }) => {
    const {model, editState} = store
    const projection = projectNode(model.root, null, editState)
    return <div>
        <h2>Editor</h2>
        <div className="editor">{projection.render(editState)}</div>
        <h2>Debug info</h2>
        <DebugInfo editState={editState} projection={projection} />
        <h2>Model as JSON</h2>
        <pre className="model">{JSON.stringify(model, null, 2)}</pre>
        <h2>Box as JSON</h2>
        <pre className="model">{JSON.stringify(projection.toJson(), null, 2)}</pre>
    </div>
})


export { Editor }

