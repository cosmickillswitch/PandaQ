/* PandQ reference content. Edit freely: the Learn page reads these lists.
   try: a sequent that opens in Prove (Fitch). Use ⊢ with nothing before it for a theorem. */
window.PQ_GLOSSARY = [
  {term:'Proposition', def:'A statement that is either true or false.', ex:'“It is raining” is one; “Shut the door” is not.', sep:'logic-propositional'},
  {term:'Atomic proposition', def:'A proposition with no connectives inside it, written as a single letter: P, Q, R, S.', ex:'P = “it is raining”', sep:'logic-propositional'},
  {term:'Connective', def:'An operator that builds a bigger formula from smaller ones. ¬ takes one formula; ∧ ∨ → ↔ take two.', ex:'P ∧ Q, ¬R', sep:'logic-propositional'},
  {term:'Truth-functional', def:'A connective is truth-functional when the truth of the whole depends only on the truth of its parts.', ex:'∧ is truth-functional; “because” is not, since two true statements need not be related as cause and effect.', sep:'logic-propositional'},
  {term:'Well-formed formula (wff)', def:'A string the formation rules allow: every letter is a wff; if A is, so is ¬A; if A and B are, so are (A ∧ B), (A ∨ B), (A → B), (A ↔ B).', ex:'(P → (Q ∧ R)) is a wff; P ∧ → Q is not.', sep:'logic-propositional'},
  {term:'Main connective', def:'The connective applied last when the formula is built. It decides what kind of formula it is.', ex:'In ¬(P ∧ Q) the main connective is ¬; in ¬P ∧ Q it is ∧.', sep:'logic-propositional'},
  {term:'Scope', def:'The part of a formula that a connective governs.', ex:'In ¬P ∧ Q, the ¬ covers only P.', sep:'logic-propositional'},
  {term:'Valuation', def:'An assignment of true or false to every letter. With n letters there are 2ⁿ valuations, one per truth-table row.', ex:'P, Q, R give 8 valuations.', sep:'logic-classical'},
  {term:'Tautology', def:'A formula true on every valuation.', ex:'P ∨ ¬P', sep:'logic-classical', try:'⊢ P ∨ ¬P'},
  {term:'Contradiction', def:'A formula false on every valuation.', ex:'P ∧ ¬P', sep:'logic-classical', try:'⊢ ¬(P ∧ ¬P)'},
  {term:'Contingent formula', def:'A formula true on some valuations and false on others.', ex:'P → Q', sep:'logic-classical'},
  {term:'Satisfiable', def:'True on at least one valuation. Every tautology and every contingent formula is satisfiable.', ex:'P ∧ Q (true when both are true)', sep:'logic-classical'},
  {term:'Logical equivalence (≡)', def:'Two formulas are equivalent when they have the same truth value on every valuation.', ex:'P → Q ≡ ¬P ∨ Q', sep:'logic-classical', try:'⊢ (P → Q) ↔ (¬P ∨ Q)'},
  {term:'Valid argument', def:'No valuation makes every premise true and the conclusion false. Validity is about form, not whether the premises are actually true.', ex:'P → Q, P, therefore Q', sep:'logical-consequence', try:'P → Q, P ⊢ Q'},
  {term:'Counterexample', def:'A valuation that makes every premise true and the conclusion false. One is enough to show invalidity.', ex:'For P → Q, Q, therefore P: the row P false, Q true.', sep:'logical-consequence', try:'P → Q, Q ⊢ P'},
  {term:'Entailment (⊨)', def:'Semantic consequence: Γ ⊨ A when every valuation making all of Γ true makes A true.', ex:'P ∧ Q ⊨ P', sep:'logical-consequence'},
  {term:'Derivability (⊢)', def:'Syntactic consequence: Γ ⊢ A when a proof of A from Γ exists using the rules of a proof system.', ex:'P ∧ Q ⊢ P by ∧E', sep:'natural-deduction', try:'P ∧ Q ⊢ P'},
  {term:'Soundness', def:'A proof system is sound if everything it proves is entailed: if Γ ⊢ A then Γ ⊨ A.', ex:'Natural deduction for classical propositional logic is sound.', sep:'logic-classical'},
  {term:'Completeness', def:'A proof system is complete if it proves everything entailed: if Γ ⊨ A then Γ ⊢ A.', ex:'Natural deduction for classical propositional logic is complete.', sep:'logic-classical'},
  {term:'Material conditional', def:'P → Q is false only when P is true and Q is false. This gives the “paradoxes”: a true Q makes P → Q true, and so does a false P.', ex:'Q ⊨ P → Q; ¬P ⊨ P → Q', sep:'logic-conditionals', try:'¬P ⊢ P → Q'},
  {term:'Modus ponens', def:'From P → Q and P, infer Q. In Fitch this is →E.', ex:'If it rains the road is wet; it rains; so the road is wet.', sep:'natural-deduction', try:'P → Q, P ⊢ Q'},
  {term:'Modus tollens', def:'From P → Q and ¬Q, infer ¬P.', ex:'If it rains the road is wet; the road isn’t wet; so it isn’t raining.', sep:'natural-deduction', try:'P → Q, ¬Q ⊢ ¬P'},
  {term:'Disjunctive syllogism', def:'From P ∨ Q and ¬P, infer Q.', ex:'Tea or coffee; not tea; so coffee.', sep:'logic-propositional', try:'P ∨ Q, ¬P ⊢ Q'},
  {term:'De Morgan’s laws', def:'¬(P ∧ Q) ≡ ¬P ∨ ¬Q, and ¬(P ∨ Q) ≡ ¬P ∧ ¬Q.', ex:'“Not both” is “one or the other is false”; “neither” is “both are false”.', sep:'logic-propositional', try:'¬(P ∨ Q) ⊢ ¬P ∧ ¬Q'},
  {term:'Explosion (ex falso)', def:'From a contradiction anything follows. Holds in classical and intuitionistic logic, but not in minimal logic, which drops ⊥E. Switch logics in Prove to see it fail.', ex:'P, ¬P ⊢ Q', sep:'logic-intuitionistic', try:'P, ¬P ⊢ Q'},
  {term:'Excluded middle', def:'P ∨ ¬P. A tautology classically, but not provable intuitionistically. Switch logics in Prove to see it fail.', ex:'P ∨ ¬P', sep:'logic-intuitionistic', try:'⊢ P ∨ ¬P'}
];

window.PQ_FALLACIES = [
  {name:'Affirming the consequent', form:'P → Q, Q ⊢ P', like:'Modus ponens', row:'P false, Q true', eng:'If it rained the road is wet; the road is wet; so it rained. (A burst pipe would also do it.)'},
  {name:'Denying the antecedent', form:'P → Q, ¬P ⊢ ¬Q', like:'Modus tollens', row:'P false, Q true', eng:'If it rained the road is wet; it didn’t rain; so the road isn’t wet.'},
  {name:'Affirming a disjunct', form:'P ∨ Q, P ⊢ ¬Q', like:'Disjunctive syllogism', row:'P true, Q true', eng:'Tea or coffee; tea; so not coffee. (Only holds if “or” is exclusive.)'},
  {name:'Denying a conjunct', form:'¬(P ∧ Q), ¬P ⊢ Q', like:'Conjunctive syllogism (¬(P ∧ Q), P, so ¬Q)', row:'P false, Q false', eng:'You can’t have both cake and ice cream; no cake; so ice cream.'},
  {name:'Converting a conditional', form:'P → Q ⊢ Q → P', like:'—', row:'P false, Q true', eng:'If it’s a dog it’s a mammal; so if it’s a mammal it’s a dog.'},
  {name:'Improper transposition', form:'P → Q ⊢ ¬P → ¬Q', like:'Contraposition (¬Q → ¬P)', row:'P false, Q true', eng:'If it’s a dog it’s a mammal; so if it’s not a dog it’s not a mammal.'}
];

window.PQ_AMBIGUITY = [
  {phrase:'“Tea or coffee?”', a:'P ∨ Q', aName:'Inclusive', b:'(P ∨ Q) ∧ ¬(P ∧ Q)', bName:'Exclusive', apart:'P true, Q true', note:'The exclusive sense is often read as conversational implicature rather than meaning.'},
  {phrase:'“I’ll bring wine and cheese or crackers”', a:'(P ∧ Q) ∨ R', b:'P ∧ (Q ∨ R)', apart:'P false, R true', note:'Bracketing. English has no brackets, so the logic forces a choice.'},
  {phrase:'“It’s not raining and cold”', a:'¬P ∧ Q', b:'¬(P ∧ Q)', apart:'P true, Q false', note:'Scope of “not”.'},
  {phrase:'“I didn’t take the bus and the train”', a:'¬(P ∧ Q)', aName:'Not both', b:'¬P ∧ ¬Q', bName:'Neither', apart:'P true, Q false', note:'Links to De Morgan’s laws.'},
  {phrase:'“We’ll go out unless it rains”', a:'¬Q → P', aName:'Weak (≡ P ∨ Q)', b:'P ↔ ¬Q', bName:'Strong', apart:'P true, Q true', note:'Do you stay in if it rains? Textbooks usually take the weak reading.'},
  {phrase:'“If you mow the lawn, I’ll pay you £10”', a:'P → Q', b:'P ↔ Q', apart:'P false, Q true', note:'Spoken conditionals are often heard as biconditionals.'},
  {phrase:'“You’ll pass only if you study”', a:'P → Q', b:'Q → P or P ↔ Q', bName:'Often misheard as', apart:'P false, Q true', note:'“Only if” introduces a necessary condition, not a sufficient one.'},
  {phrase:'“If it’s sunny we’ll swim and have lunch outside”', a:'P → (Q ∧ R)', b:'(P → Q) ∧ R', apart:'P false, R false', note:'Is lunch outside conditional on the sun?'},
  {phrase:'“If it’s sunny, then if it’s warm, we’ll swim”', a:'P → (Q → R)', b:'(P ∧ Q) → R', apart:'Nowhere: equivalent', note:'Not actually ambiguous; a good “prove it” exercise.', try:'P → (Q → R) ⊢ (P ∧ Q) → R'},
  {phrase:'“They got married and had a baby”', a:'P ∧ Q', b:'Q ∧ P', apart:'Nowhere in logic', note:'English “and” often means “and then”; ∧ ignores order. Shows the limit of truth-functionality.'}
];

window.PQ_WELLFORMED = [
  {s:'P ∧ ∧ Q', why:'A binary connective needs a formula on each side.', fix:'P ∧ Q'},
  {s:'P Q', why:'Two formulas with nothing joining them.', fix:'P ∧ Q, P ∨ Q, …'},
  {s:'P¬Q', why:'¬ goes in front of one formula; it doesn’t join two.', fix:'P ∧ ¬Q'},
  {s:'(P → Q', why:'Brackets must balance.', fix:'(P → Q)'},
  {s:'P ∧ Q ∨ R', why:'Strictly ill-formed: the rules give each binary connective its own brackets. Without them, the reader can’t tell which reading is meant.', fix:'(P ∧ Q) ∨ R or P ∧ (Q ∨ R)'},
  {s:'P → Q → R', why:'Same problem. Some books group to the right by convention; others don’t allow it.', fix:'P → (Q → R)'},
  {s:'¬(P)', why:'Harmless, but the rules never put brackets round a single letter.', fix:'¬P'},
  {s:'P(Q)', why:'Applying one proposition to another means nothing here. It’s the shape of predicate or higher-order logic, not propositional.', fix:'—'},
  {s:'P ∧ P, ¬¬P', why:'Both well-formed. Included to show that well-formed isn’t the same as useful: they’re equivalent to P.', fix:'P'}
];
