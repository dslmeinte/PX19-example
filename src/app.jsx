import React from "react"
import { render } from "react-dom"
import { action, configure } from "mobx"
import { onError } from "mobx-react"
import DevTools from "mobx-react-devtools"
import { Editor } from "./editor"
import { projectNode } from "./projection"
import { Model, store } from "./store"

// some global config of MobX:
configure({ enforceActions: "always" })
onError(console.error)

const {model, editState} = store
const projection = projectNode(model.root, null, editState)
const focusNow = projection.firstFocusableBox()
if (focusNow) {
    editState.setFocusBox(focusNow)
}

// fire up React:
render(
  <div>
    <h1>Projectional Editing</h1>
    <label>Model:
        <select onChange={action(event => {
          store.model.setRoot(Model.modelRoots[event.target.value])
          store.editState.setFocusBox(null)
        })}>
          {Object.getOwnPropertyNames(Model.modelRoots).map(name => <option key={"model-" + name}>{name}</option>)}
        </select>
    </label>
    <Editor store={store} />
    <DevTools />
  </div>,
  document.getElementById("root")
)

