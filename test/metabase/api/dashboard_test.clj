(ns metabase.api.dashboard-test
  "Tests for /api/dashboard endpoints."
  (:require [expectations :refer :all]
            [metabase.api.card-test :refer [post-card]]
            [metabase.db :as db]
            [metabase.driver.query-processor.expand :as ql]
            [metabase.http-client :as http]
            [metabase.middleware :as middleware]
            (metabase.models [hydrate :refer [hydrate]]
                             [card :refer [Card]]
                             [dashboard :refer [Dashboard]]
                             [dashboard-card :refer [DashboardCard]]
                             [user :refer [User]])
            [metabase.test.data :refer :all]
            [metabase.test.data.users :refer :all]
            [metabase.test.util :as tu]
            [korma.core :as k]))


;; ## Helper Fns
(defn user-details [user]
  (tu/match-$ user
              {:id $
               :email $
               :date_joined $
               :first_name $
               :last_name $
               :last_login $
               :is_superuser $
               :common_name $}))

(defn dashcard-response [{:keys [card created_at updated_at] :as dashcard}]
  (-> (into {} dashcard)
      (dissoc :id :dashboard_id :card_id)
      (assoc :created_at (not (nil? created_at)))
      (assoc :updated_at (not (nil? updated_at)))
      (assoc :card (-> (into {} card)
                       (dissoc :id :database_id :table_id :created_at :updated_at)))))

(defn dashboard-response [{:keys [creator ordered_cards created_at updated_at] :as dashboard}]
  (let [dash (-> (into {} dashboard)
                 (dissoc :id)
                 (assoc :created_at (not (nil? created_at)))
                 (assoc :updated_at (not (nil? updated_at))))]
    (cond-> dash
            creator (update :creator #(into {} %))
            ordered_cards (update :ordered_cards #(mapv dashcard-response %)))))


;; ## /api/dashboard/* AUTHENTICATION Tests
;; We assume that all endpoints for a given context are enforced by the same middleware, so we don't run the same
;; authentication test on every single individual endpoint

(expect (get middleware/response-unauthentic :body) (http/client :get 401 "dashboard"))
(expect (get middleware/response-unauthentic :body) (http/client :put 401 "dashboard/13"))


;; ## POST /api/dash

;; test validations
(expect {:errors {:name "field is a required param."}}
  ((user->client :rasta) :post 400 "dashboard" {}))

(expect
  {:name            "Test Create Dashboard"
   :description     nil
   :creator_id      (user->id :rasta)
   :public_perms    0
   :updated_at      true
   :created_at      true
   :organization_id nil}
  (-> ((user->client :rasta) :post 200 "dashboard" {:name         "Test Create Dashboard"
                                                    :public_perms 0})
      dashboard-response))


;; ## GET /api/dashboard/:id
(expect
  {:dashboard {:name            "Test Dashboard"
               :description     nil
               :creator_id      (user->id :rasta)
               :creator         (user-details (fetch-user :rasta))
               :public_perms    0
               :can_read        true
               :can_write       true
               :updated_at      true
               :created_at      true
               :ordered_cards   [{:sizeX        2
                                  :sizeY        2
                                  :col          nil
                                  :row          nil
                                  :updated_at   true
                                  :created_at   true
                                  :card         {:name                   "Dashboard Test Card"
                                                 :description            nil
                                                 :public_perms           0
                                                 :creator_id             (user->id :rasta)
                                                 :creator                (user-details (fetch-user :rasta))
                                                 :organization_id        nil
                                                 :display                "scalar"
                                                 :query_type             nil
                                                 :dataset_query          {:something "simple"}
                                                 :visualization_settings {:global {:title nil}}}}]
               :organization_id nil}}
  ;; fetch a dashboard WITH a dashboard card on it
  (tu/with-temp Dashboard [{dashboard-id :id} {:name         "Test Dashboard"
                                               :public_perms 0
                                               :creator_id   (user->id :rasta)}]
    (tu/with-temp Card [{card-id :id} {:name                   "Dashboard Test Card"
                                       :creator_id             (user->id :rasta)
                                       :public_perms           0
                                       :display                "scalar"
                                       :dataset_query          {:something "simple"}
                                       :visualization_settings {:global {:title nil}}}]
      (tu/with-temp DashboardCard [_ {:dashboard_id dashboard-id
                                      :card_id      card-id}]
        (-> ((user->client :rasta) :get 200 (format "dashboard/%d" dashboard-id))
            (update :dashboard dashboard-response))))))


;; ## PUT /api/dashboard/:id
(expect
  [{:name            "Test Dashboard"
    :description     nil
    :creator_id      (user->id :rasta)
    :public_perms    0
    :updated_at      true
    :created_at      true
    :organization_id nil}
   {:name            "My Cool Dashboard"
    :description     "Some awesome description"
    :actor_id        (user->id :rasta)
    :creator_id      (user->id :rasta)
    :public_perms    0
    :updated_at      true
    :created_at      true
    :organization_id nil}
   {:name            "My Cool Dashboard"
    :description     "Some awesome description"
    :creator_id      (user->id :rasta)
    :public_perms    0
    :updated_at      true
    :created_at      true
    :organization_id nil}]
  (tu/with-temp Dashboard [{dashboard-id :id} {:name         "Test Dashboard"
                                               :public_perms 0
                                               :creator_id   (user->id :rasta)}]
    (->> [(Dashboard dashboard-id)
          ((user->client :rasta) :put 200 (format "dashboard/%d" dashboard-id) {:name         "My Cool Dashboard"
                                                                                :description  "Some awesome description"
                                                                                ;; these things should fail to update
                                                                                :public_perms 2
                                                                                :creator_id   (user->id :trashbird)})
          (Dashboard dashboard-id)]
         (mapv dashboard-response))))


;; ## DELETE /api/dashboard/:id
(expect
  [nil nil]
  (tu/with-temp Dashboard [{dashboard-id :id} {:name         "Test Dashboard"
                                               :public_perms 0
                                               :creator_id   (user->id :rasta)}]
    [((user->client :rasta) :delete 204 (format "dashboard/%d" dashboard-id))
     (Dashboard dashboard-id)]))


;; # DASHBOARD CARD ENDPOINTS

;; ## POST /api/dashboard/:id/cards
(expect
  [{:sizeX        2
    :sizeY        2
    :col          nil
    :row          nil
    :created_at   true
    :updated_at   true}
   [{:sizeX        2
     :sizeY        2
     :col          nil
     :row          nil}]]
  (tu/with-temp Dashboard [{dashboard-id :id} {:name         "Test Dashboard"
                                               :public_perms 0
                                               :creator_id   (user->id :rasta)}]
    (tu/with-temp Card [{card-id :id} {:name                   "Dashboard Test Card"
                                       :creator_id             (user->id :rasta)
                                       :public_perms           0
                                       :display                "scalar"
                                       :dataset_query          {:something "simple"}
                                       :visualization_settings {:global {:title nil}}}]
      [(-> ((user->client :rasta) :post 200 (format "dashboard/%d/cards" dashboard-id) {:cardId card-id})
           (dissoc :id :dashboard_id :card_id)
           (update :created_at #(not (nil? %)))
           (update :updated_at #(not (nil? %))))
       (db/sel :many :fields [DashboardCard :sizeX :sizeY :col :row] :dashboard_id dashboard-id)])))


;; ## DELETE /api/dashboard/:id/cards
(expect
  [1
   nil
   0]
  ;; fetch a dashboard WITH a dashboard card on it
  (tu/with-temp Dashboard [{dashboard-id :id} {:name         "Test Dashboard"
                                               :public_perms 0
                                               :creator_id   (user->id :rasta)}]
    (tu/with-temp Card [{card-id :id} {:name                   "Dashboard Test Card"
                                       :creator_id             (user->id :rasta)
                                       :public_perms           0
                                       :display                "scalar"
                                       :dataset_query          {:something "simple"}
                                       :visualization_settings {:global {:title nil}}}]
      (tu/with-temp DashboardCard [{dashcard-id :id} {:dashboard_id dashboard-id
                                                      :card_id      card-id}]
        [(count (db/sel :many :field [DashboardCard :id] :dashboard_id dashboard-id))
         ((user->client :rasta) :delete 204 (format "dashboard/%d/cards" dashboard-id) :dashcardId dashcard-id)
         (count (db/sel :many :field [DashboardCard :id] :dashboard_id dashboard-id))]))))


;; ## POST /api/dashboard/:id/reposition
(expect
  [[{:sizeX        2
     :sizeY        2
     :col          nil
     :row          nil}
    {:sizeX        2
     :sizeY        2
     :col          nil
     :row          nil}]
   {:status "ok"}
   [{:sizeX        4
     :sizeY        2
     :col          0
     :row          0}
    {:sizeX        1
     :sizeY        1
     :col          1
     :row          3}]]
  ;; fetch a dashboard WITH a dashboard card on it
  (tu/with-temp Dashboard [{dashboard-id :id} {:name         "Test Dashboard"
                                               :public_perms 0
                                               :creator_id   (user->id :rasta)}]
    (tu/with-temp Card [{card-id :id} {:name                   "Dashboard Test Card"
                                       :creator_id             (user->id :rasta)
                                       :public_perms           0
                                       :display                "scalar"
                                       :dataset_query          {:something "simple"}
                                       :visualization_settings {:global {:title nil}}}]
      (tu/with-temp DashboardCard [{dashcard-id1 :id} {:dashboard_id dashboard-id
                                                       :card_id      card-id}]
        (tu/with-temp DashboardCard [{dashcard-id2 :id} {:dashboard_id dashboard-id
                                                         :card_id      card-id}]
          [(db/sel :many :fields [DashboardCard :sizeX :sizeY :row :col] :dashboard_id dashboard-id (k/order :id :asc))
           ((user->client :rasta) :post 200 (format "dashboard/%d/reposition" dashboard-id) {:cards [{:id    dashcard-id1
                                                                                                      :sizeX 4
                                                                                                      :sizeY 2
                                                                                                      :col   0
                                                                                                      :row   0}
                                                                                                     {:id    dashcard-id2
                                                                                                      :sizeX 1
                                                                                                      :sizeY 1
                                                                                                      :col   1
                                                                                                      :row   3}]})
           (db/sel :many :fields [DashboardCard :sizeX :sizeY :row :col] :dashboard_id dashboard-id (k/order :id :asc))])))))
