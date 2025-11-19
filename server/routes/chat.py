from flask import request, jsonify

from ..agent import agent_executor


def register_routes(app):
    @app.route("/chat", methods=["POST"])
    def chat():
        data = request.get_json()
        query = data.get("message", "")

        if not query:
            return jsonify({"reply": "⚠️ No input received."}), 400

        try:
            response = agent_executor.invoke({"query": query})
            return jsonify({"reply": response["output"]})
        except Exception as e:
            return jsonify({"reply": f"❌ Agent error: {str(e)}"}), 500