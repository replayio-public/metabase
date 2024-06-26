(ns metabase.models.revision.diff
  (:require
   [clojure.core.match :refer [match]]
   [clojure.data :as data]
   [metabase.util.i18n :refer [deferred-tru]]
   [toucan2.core :as t2]))

(defn- diff-string [k v1 v2 identifier]
  (match [k v1 v2]
    [:name _ _]
    (deferred-tru "renamed {0} from \"{1}\" to \"{2}\"" identifier v1 v2)

    [:description nil _]
    (deferred-tru "added a description")

    [:description (_ :guard some?) _]
    (deferred-tru "changed the description")

    [:private true false]
    (deferred-tru "made {0} public" identifier)

    [:private false true]
    (deferred-tru "made {0} private" identifier)

    [:archived false true]
    (deferred-tru "unarchived this")

    [:archived true false]
    (deferred-tru "archived this")

    [:dataset false true]
    (deferred-tru "turned this into a model")

    [:dataset false false]
    (deferred-tru "changed this from a model to a saved question")

    [:display _ _]
    (deferred-tru "changed the display from {0} to {1}" (name v1) (name v2))

    [:result_metadata _ _]
    (deferred-tru "edited the metadata")

    [:dataset_query _ _]
    (deferred-tru "modified the query")

    [:collection_id nil (coll-id :guard int?)]
    (deferred-tru "moved {0} to {1}" identifier (t2/select-one-fn :name 'Collection coll-id))

    [:collection_id (prev-coll-id :guard int?) (coll-id :guard int?)]
    (deferred-tru "moved {0} from {1} to {2}"
      identifier
      (t2/select-one-fn :name 'Collection prev-coll-id)
      (t2/select-one-fn :name 'Collection coll-id))

    [:visualization_settings _ _]
    (deferred-tru "changed the visualization settings")

    :else nil))

(defn build-sentence
  "Join parts of a sentence together to build a compound one."
  [parts]
  (when (seq parts)
    (cond
      (= (count parts) 1) (str (first parts) \.)
      (= (count parts) 2) (str (first parts) " " (deferred-tru "and")  " " (second parts) \.)
      :else               (str (first parts) ", " (build-sentence (rest parts))))))

(defn ^:private model-str->i18n-str
  [model-str]
  (case model-str
    "Dashboard" (deferred-tru "Dashboard")
    "Card"      (deferred-tru "Card")
    "Segment"   (deferred-tru "Segment")
    "Metric"    (deferred-tru "Metric")))

(defn diff-strings*
  "Create a seq of string describing how `o1` is different from `o2`.
  The directionality of the statement should indicate that `o1` changed into `o2`."
  [model o1 o2]
  (when-let [[before after] (data/diff o1 o2)]
    (let [ks         (keys (or after before))
          model-name (model-str->i18n-str model)]
      (filter identity
              (map-indexed (fn [i k]
                             (diff-string k (k before) (k after)
                                          (if (zero? i) (deferred-tru "this {0}" model-name) (deferred-tru "it"))))
                           ks)))))
