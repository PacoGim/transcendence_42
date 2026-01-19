import { navigate } from "../js/routing.js";
import { TournamentStore } from "./tournament/tournament.store.js";
import { TournamentModel } from "./tournament/tournament.model.js";

const $pageTournamentTree = document.querySelector('page[type="tournament_tree"]')!;
const $container = document.getElementById("tournament-tree")!;

/* =========================
   Store subscription
========================= */

const unsubscribe = TournamentStore.subscribe((tournament: TournamentModel | null) => {
	if (!tournament)
	{
		navigate('tournament_select')
		return
	}
	render(tournament);
});

function render(model: TournamentModel) {
	const semi1 = model.matches[0];
	const semi2 = model.matches[1];
	const final = model.matches[2];

	$container.innerHTML = `
		<div class="tournament">

			<div class="round">
				<h3>Demi-finales</h3>

				${renderMatch("Demi-finale 1", semi1, model.currentMatch === 0)}
				${renderMatch("Demi-finale 2", semi2, model.currentMatch === 1)}
			</div>

			<div class="round">
				<h3>Finale</h3>

				${renderMatch("Finale", final, model.currentMatch === 2)}
			</div>

			<div class="round">
				<h3>Vainqueur</h3>
				<div class="winner">
					${model.winner?.alias ?? "—"}
				</div>
			</div>

			<div class="actions">
				${renderAction(model)}
			</div>

		</div>
	`;
}

function renderMatch(
	label: string,
	match: any,
	isCurrent: boolean
) {
	if (!match) {
		return `
			<div class="match placeholder ${isCurrent ? "current" : ""}">
				${label}
			</div>
		`;
	}

	return `
		<div class="match ${isCurrent ? "current" : ""}">
			<div class="players">
				<span>${match.playerLeft?.alias}</span>
				<strong>${match.score[0]} : ${match.score[1]}</strong>
				<span>${match.playerRight?.alias}</span>
			</div>
		</div>
	`;
}

function renderAction(model: TournamentModel) {
	if (model.currentMatch >= 3) {
		return `<span class="done">Tournoi terminé</span>
		<button data-route=''>home</button>`;
	}

	return `
		<button id="play-match">
			Jouer le match
		</button>
	`;
}

function nextMatch(event : any)
{
	const target = event.target as HTMLElement;
	if (target.id === "play-match") {
		navigate("tournament_match");
	}
}

$container.addEventListener("click", nextMatch);

/* =========================
   Cleanup SPA
========================= */

const cleanupTournamentTree = () => {
    console.log("tournament_tree cleanup: ")
	unsubscribe();
	$container.removeEventListener("click", nextMatch)
	$pageTournamentTree.removeEventListener("cleanup", cleanupTournamentTree);
};

$pageTournamentTree.addEventListener("cleanup", cleanupTournamentTree);
