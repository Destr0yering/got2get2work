# Independent AI review results

Reviewed August 10, 2026. These are advisory red-team findings, not customer evidence or traction.

## OpenRouter

The external reviewer identified credibility, buyer effort, privacy, and actionability as stronger
objections than the $199 price. It recommended positioning the offer as a fixed-scope diagnostic
that informs a specific employer decision, defining the inputs and the start of the 48-hour clock,
and avoiding undefined claims such as “privacy-safe.”

Highest-value qualifying questions:

1. What evidence suggests commuting, rather than scheduling, supervision, compensation, or another issue, contributes to the problem?
2. Which worksite and shift cohort is in scope, and approximately how many employees are in it?
3. What decision should the assessment inform, who owns it, and by when?
4. What aggregate data is available, and who can authorize its use?
5. If the assessment identifies a credible issue, is there an owner and budget path for action?

Actions applied before commit: replaced “privacy-safe” with specific data-minimization language,
aligned the delivery clock with discovery plus receipt of agreed inputs, expanded the privacy notice,
and strengthened route and sitemap tests.

## Google AI Studio

The prompt was submitted in the authenticated Google AI Studio session, but the selected model
returned an internal error. AI Studio then required linking a paid API key before another run. No
key was linked and no account or billing configuration was changed.
