import { GameModel, GameView, GameController } from "../classes/OriginalPong2D.ts";
import { StateStore } from "../stores/state.store.ts";

const $pageLocalGame = document.querySelector("page[type=local_game]")!;
const $canvas = document.querySelector("#canvas2D") as HTMLCanvasElement
// Création de l'arène et du Pong
const createdGame = StateStore.getCreatedGame()
const model = new GameModel();
if (createdGame){
    model.init(createdGame.pseudo1, createdGame.pseudo2, false);
}
else
{
    model.init()
}
const view = new GameView($canvas);
const aiActivated = createdGame?.ai || false
const controller = new GameController(model, view, aiActivated);

window.onresize = view.resize
view.resize();
view.render(model)

function popUpDefault(event : any)
{
    event.preventDefault()
    console.log("local_game popup: ", event)
}

window.addEventListener("beforeunload", popUpDefault)
window.addEventListener("popstate", popUpDefault);

/* =========================
   Cleanup SPA
========================= */

const cleanupLocalGame = () => {
    console.log("local_game cleanup: ")
    controller.destroy();
    window.removeEventListener("beforeunload", popUpDefault)
    window.removeEventListener("popstate", popUpDefault)
    $pageLocalGame.removeEventListener("cleanup", cleanupLocalGame)
}

$pageLocalGame.addEventListener("cleanup", cleanupLocalGame);

